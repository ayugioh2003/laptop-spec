import axios from 'axios';
import cheerio from 'cheerio';
import iconv from 'iconv-lite';
import fs from 'fs';
import dayjs from 'dayjs';
import { CRAWLER_CONFIG } from './config.js';

const config = {
  url: CRAWLER_CONFIG.URL,
  method: 'GET',
  responseType: 'arraybuffer', // 用於處理二進制資料
};

const processData = async function (responseData) {
  try {
    const body = iconv.decode(Buffer.from(responseData), CRAWLER_CONFIG.ENCODING);

  const $ = cheerio.load(body); // 載入 body
  const cardList = $('.main').find('span')
  const cardListLength = cardList.length
  const result = [];

  for (let i = 0; i < cardListLength; i += 1) {
    const card = cardList[i];

    const saveNumber = CRAWLER_CONFIG.MIN_CHILDREN
    if (card.children.length < saveNumber) {
      continue;
    }

    const unUselessElementIndex = CRAWLER_CONFIG.REMOVE_USELESS_ELEMENT_INDEX // 好像是換行符號，最近加進來的，會影響 index
    card.children = card.children.filter((child, index) => index !== unUselessElementIndex)

    const template = {
      img: card.children[0].attribs.src,
      name: card.children[1].children[0].data,
      size: card.children[2].children?.[0].data || '',
      cpu: card.children[3].children[0].data,
      ram: card.children[4].children[0].data,
      ssd: card.children[5].children[0].data,
      vga: card.children[6].children[0].data,
      interface: card.children[7].children[0].data,
      weight: card.children[8].children[0].data,
      os: card.children[9].children[0].data,
      price: card.children[10].children[0].data,
    }
    result.push(template);
  }

  let onlyLaptopResult = result;
  
  // 過濾掉不相關的產品
  CRAWLER_CONFIG.FILTERS.EXCLUDED_KEYWORDS.forEach(keyword => {
    onlyLaptopResult = onlyLaptopResult.filter(item => !JSON.stringify(item).includes(keyword));
  });
  
  // 只保留包含顯卡資訊的產品
  onlyLaptopResult = onlyLaptopResult.filter((item) => CRAWLER_CONFIG.FILTERS.REQUIRED_PATTERN.test(JSON.stringify(item)))
    .map((item, index) => {
      return {
        index: index + 1 ,
        ...item,
      }
    })


  const methods =  {
    getBrand(nameText) {
      if (nameText.includes('捷元')) return '捷元'
      return [...nameText].filter(char => char !== '★').join('').split(' ')[0];
    },
    getSize(sizeText) {
      return Number(sizeText.match(/尺寸：(\d+\.?\d).+/)?.[1])
    },
    getCpu(cpuText) {
      const splitArr = cpuText.split(' ');
      const cpuBrand = splitArr[0].match(/CPU：(.+)/)?.[1]
      const cpuLevel = splitArr[1].includes('-') ? splitArr[1].match(/(.+)-/)?.[1]
        : splitArr[1]
      return `${cpuBrand} ${cpuLevel}`;
    },
    getRamBasic(ramText) {
      const regularResultGB = ramText.match(/([0-9]*)GB/)
      const regularResultG = ramText.match(/([0-9]*)G/)

      if (regularResultGB == null && regularResultG == null) {
        return null
      } else if (regularResultGB) {
        return Number(regularResultGB[1])
      } else if (regularResultG) {
        return Number(regularResultG[1])
      }
    },
    getRamMax(ramText) {
      const regularResult_G = ramText.match(/Max ([0-9]*)G/) || ramText.match(/Max([0-9]*)G/)
      const regularResultDotG = ramText.match(/Max\.([0-9]*)G/)
      const regularResultColonG = ramText.match(/Max\: ([0-9]*)G/) || ramText.match(/Max\:([0-9]*)G/)

      if (
        regularResult_G == null &&
        regularResultDotG == null &&
        regularResultColonG == null
      ) {
        return null
      } else if (regularResult_G) {
        return Number(regularResult_G[1])
      } else if (regularResultDotG) {
        return Number(regularResultDotG[1])
      } else if (regularResultColonG) {
        return Number(regularResultColonG[1])
      }
    },
    getSSD(ssdText) {
      const tb = ssdText.match(/(\d+)TB/)
      const gb = ssdText.match(/(\d+)(GB|G)/)
      if (tb == null && gb == null) {
        return null
      } else if (tb) {
        return Number(tb[1]) * 1024
      } else if (gb) {
        return Number(gb[1])
      }
    },
    getVGA(vgaText) {
      const cleanString = vgaText.split('VGA：')[1] || vgaText.split('獨顯：')[1] || vgaText.split('內顯：')[1]
      const brand = cleanString?.[0]
      if (brand === 'Intel') return 'Intel'
      return cleanString.split(' ').splice(0, 2).join(' ')
    },
    getThunderbolt(interfaceText) {
      return interfaceText.includes('Thunderbolt ');
    },
    getWeight(weightText) {
      const regularResultG = weightText.match(/([0-9.]*)g/)
      const regularResultKG = weightText.match(/([0-9.]*)Kg/i)
      const regularResultNoKG = weightText.match(/([0-9.]*) /i)

      if (
        regularResultG == null &&
        regularResultKG == null &&
        regularResultNoKG == null
      ) {
        return null
      } else if (regularResultKG) {
        return Number(regularResultKG[1])
      } else if (regularResultG) {
        return Number(regularResultG[1]) / 1000
      } else if (regularResultNoKG) {
        return Number(regularResultNoKG[1])
      }
    },
    getPrice(priceText) {
      return Number(priceText.match(/NT([0-9]+)/)[1]);
    }
  };

  const laptopResult = onlyLaptopResult.map(item => {
    const property = {
      brand: methods.getBrand(item.name),
      size: methods.getSize(item.size),
      cpu: methods.getCpu(item.cpu),
      ramBasic: methods.getRamBasic(item.ram),
      ramMax: methods.getRamMax(item.ram) || methods.getRamBasic(item.ram),
      ssd: methods.getSSD(item.ssd),
      vga: methods.getVGA(item.vga),
      // dp: '',
      thunderbolt: methods.getThunderbolt(item.interface),
      weight: methods.getWeight(item.weight),
      price: methods.getPrice(item.price), // 11
      date: dayjs().format('YYYY-MM-DD'),
      time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    };

    const template = {
      ...item,
      property,
    }
    return template;
  })

  const todayObj = new Date();
  todayObj.setUTCHours(todayObj.getUTCHours() + 8)
  const todayString = todayObj.toISOString().slice(0, 10);

  // fs.writeFile(`./src/assets/result/${todayString}.json`, JSON.stringify(laptopResult), 
  //   function(err, data) {
  //     if (err) throw err;
  //   }
  // )
    fs.writeFile(`${CRAWLER_CONFIG.OUTPUT_PATH}latest_date.json`, JSON.stringify(laptopResult), 
      function(err, data) {
        if (err) {
          console.error('寫入檔案失敗:', err);
          throw err;
        }
        console.log('資料已成功寫入 latest_date.json');
      }
    )
  } catch (error) {
    console.error('處理資料時發生錯誤:', error);
    throw error;
  }
}

const getList = async function() {
  try {
    const response = await axios(config);
    await processData(response.data);
  } catch (error) {
    console.error('爬蟲執行失敗:', error);
    process.exit(1);
  }
}

getList()


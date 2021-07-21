const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite')
const fs = require('fs');
const dayjs = require('dayjs')

// const axios = require('axios');
// const { default: Axios } = require('axios');

const config = {
  url: 'http://www.coolpc.com.tw/eachview.php?IGrp=2',
  encoding: 'utf8',
  method: 'GET',
  encoding: 'binary',
};

const callbackFunction = function (error, response, body) {
  if (error || !body) {
    console.log(error);
    return;
  }

  body = iconv.decode(body, 'big5')

  const $ = cheerio.load(body); // 載入 body
  const cardList = $('.main').find('span')
  const cardListLength = cardList.length
  const result = [];

  for (let i = 0; i < cardListLength; i += 1) {
    const card = cardList[i];

    console.log('card.children.length', card.children.length);
    if (card.children.length < 11) {
      continue;
    }

    const template = {
      img: card.children[0].attribs.src,
      name: card.children[1].children[0].data,
      size: card.children[2].children[0].data,
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

  const onlyLaptopResult = result
    .filter((item) => !JSON.stringify(item).includes('電源'))
    .filter((item) => !JSON.stringify(item).includes('相機'))
    .filter((item) => !JSON.stringify(item).includes('手錶'))
    .filter((item) => !JSON.stringify(item).includes('手機'))
    .filter((item) => !JSON.stringify(item).includes('充電器'))
    .filter((item) => !JSON.stringify(item).includes('快充'))
    .map((item, index) => {
      return {
        index: index + 1 ,
        ...item,
      }
    })

  console.log('onlyLaptopResult', onlyLaptopResult)

  const methods =  {
    getBrand(nameText) {
      if (nameText.includes('捷元')) return '捷元'
      return nameText.split(' ')[0];
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
      const regularResult_G = ramText.match(/Max ([0-9]*)G/)
      const regularResultDotG = ramText.match(/Max\.([0-9]*)G/)
      const regularResultColonG = ramText.match(/Max\: ([0-9]*)G/)

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
      console.log(vgaText)
      const cleanString = vgaText.split('VGA：')[1]
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
    console.log('item', item)
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
  fs.writeFile(`./src/assets/result/latest_date.json`, JSON.stringify(laptopResult), 
    function(err, data) {
      if (err) throw err;
    }
  )
}

const getList = async function() {
  request(config, callbackFunction)
}

getList()


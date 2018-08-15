async function getPriceYearPageSum(year, page, parseFunc) {
    const url = 'https://www.amazon.co.jp/gp/css/order-history?digitalOrders=1&unifiedOrders=1&orderFilter=year-' + year + '&startIndex=' + page * 10;
    const result = await fetch(url, {credentials: "include"});
    const html = await result.text()
    return parseFunc(html);
}

async function getPriceYearSum(year, parseFunc) {
    var page = 0;
    var sum = 0;
    try { while(true) {
        sum += await getPriceYearPageSum(year, page, parseFunc);
        page += 1;
      } } catch (e) { }
  console.log(sum);
  return sum;
}

function parseHtmlAndCalcSum(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    var sum = 0;
    const orderCollection = doc.querySelectorAll('div.order');
    if(orderCollection.length == 0) return Promise.reject("no order");
    Array.prototype.forEach.call(orderCollection, function(order) {
        var totalPrice = Number(order.querySelectorAll('div.order-info span.value')[1].innerText.replace("￥", "").replace(",", ""));
        if(Number.isNaN(totalPrice)) { console.log('NaN is detected.'); totalPrice = 0 }

        var sumInOrder = 0;
        const items = order.getElementsByClassName("a-fixed-left-grid-col a-col-right");
        Array.prototype.forEach.call(items, function(item) {
            const titleCollection = item.getElementsByClassName("a-link-normal");
            if(titleCollection.length != 1) { console.log(titleCollection) }
            if(titleCollection.length < 1) { console.log("somethin wrong"); return }

            const title = titleCollection[0].innerText;
            const matched = /数量：([0-9]+)/.exec(title);
            var count = (matched != null && matched.length == 2) ? Number(matched[1]) : 1;
            if(Number.isNaN(count)) { console.log('NaN is detected.'); console.log(matched); count = 1 }

            const priceCollection = item.getElementsByClassName('a-color-price');
            if(priceCollection.length != 1) { console.log(priceCollection); return }
            const price = Number(priceCollection[0].innerText.replace("￥", "").replace(",", ""));
            if(Number.isNaN(price)) { console.log('NaN is detected.'); console.log(priceCollection); return }

            sumInOrder += price * count;
        });

        sum += Math.max(totalPrice, sumInOrder);
    });
    console.log(sum);
    return sum;
}
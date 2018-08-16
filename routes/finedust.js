var express = require('express');
var router = express.Router();
var request = require('request');
var parseString = require('xml2js').parseString; // xml parsing -> json
var inspect = require('util').inspect;
var fs = require('fs');

router.post('/city',function(req,res){ // 지역별로 도시의 미세먼지 확인
  // API 요청
  
  // ServiceKey 보안
  var secret = fs.readFileSync('./secret.json');
  var data = JSON.parse(secret);
  const ServiceKey = data.ServiceKey;
  
  var body = req.body;
  var arr_city = body.city.split(" "); // 구와 시를 나눔
  
  var city = arr_city[0];
  var district = arr_city[1];

  var request_url = "http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst";

  var queryParams = '?' + encodeURIComponent('ServiceKey') + `=${ServiceKey}`; /* Service Key*/
  queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('50'); /* 한 페이지 결과 수 */
  queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* 페이지 번호 */
  queryParams += '&' + encodeURIComponent('sidoName') + '=' + encodeURIComponent(city); /* 도시 이름 */
  queryParams += '&' + encodeURIComponent('searchCondition') + '=' + encodeURIComponent('HOUR');
  
  request({
    url: request_url + queryParams,
    method: 'GET'
  }, function (error, response, body) {
    parseString(body, function(err,result){ // xml parsing
      var finedust_info = result.response.body[0].items[0].item;
      var context = {};
      
      context['city'] = city;
      context['district'] = district;
      context['items'] = finedust_info;

      res.render('finedust_detail',context);
    });
  });
});

module.exports = router;
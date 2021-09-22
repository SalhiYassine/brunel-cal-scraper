const puppeteer = require("puppeteer");


(async ()=> {

    
    const browser = await puppeteer.launch();
    
    const page = await browser.newPage();
    await page.goto('https://teaching.brunel.ac.uk/teaching/SWS-2122/login.aspx');
    
    await page.type('[name=tUserName]', '1908906');
    await page.type('[name="tPassword"]', 'Katia1974');
    await page.click('[type=submit]');
    await page.waitForTimeout(400)
    await page.click('a[id="LinkBtn_mystudentsettimetable"]')
    await page.waitForTimeout(400)
    await page.select('select[name="lbWeeks"]','1')
    await page.waitForTimeout(400)
    await page.select('select[name="dlType"]','TextSpreadsheet;swsurl;SWSCUST Object TextSpreadsheet')
    await page.waitForTimeout(400)
    await page.click('[type=submit]');
    await page.waitForTimeout(400)    
    const monday_date = await page.evaluate(() => {
        function getMonthFromString(mon){
            return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1
         }
        let monday_date = document.getElementsByClassName('header-1-2-3')[0].textContent.split('-')[0].split(" ")
        let day = monday_date[0]
        let month = getMonthFromString(monday_date[1])
        let year = monday_date[2]
        return new Date(`${year}-${month}-${day}`)
      });
    console.log(monday_date)
    const result = await page.$$eval('.spreadsheet', tables => {
        let week = []
        for(let i = 0; i < tables.length; i++){
            // let date = monday_date
            const table = tables[i]
            const rows = table.querySelectorAll('tr')
            let day = Array.from(rows, row => {
                const columns = row.querySelectorAll('td');
                let arr = Array.from(columns, column => column.innerText)
                arr.push(i+1);
                return arr 
            });
            week.push(day)
        }
        return week
      });
    
      let formated_results = (monday_date, result) =>{
          let events = []
          result.map((day)=>{
             
              day.map((event, index)=>{
                  if(index !== 0){

                      let e = {
                          title: event[0],
                          description: event[1],
                          start: event[2],
                          end: event[3],
                          room: event[4]
                        }
                        console.log(e)
                        events.push(e)
                    }
                })
            })
            
            
            

        return events
    }
    console.log(formated_results(monday_date, result))
    // console.log(await page.content());
    await page.screenshot({path: 'screenshot.png'});
    
    await browser.close();
})();


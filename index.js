const puppeteer = require("puppeteer");
const ical = require('ical-generator')
const { v4: uuidv4 } = require('uuid');
const express = require('express')

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
const port = 7000

app.post('/', async(req, res) => {
    const fileID = await fetchData(req.body.username, req.body.password)
    if(fileID){
        console.log(fileID)
        res.status(200)
        res.send(fileID)
    }else{
        console.log(fileID)
        res.status(400)
        res.send('Something went wrong :/')
    }
  })


app.get('/:id', (req, res) => {
    res.download(`./calendars/${req.params.id}.ical`)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


let formated_results = (monday_date, result) =>{
    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days-1);
        return result;
    }
    let events = []
    result.map((day)=>{
        
        day.map((event, index)=>{
            if(index !== 0){
                let temp_desc = event[1].replace(/\s/g, '');
                const date = addDays(monday_date, event[8])
                let e = {
                    summary: temp_desc ? event[1] : event[0],
                    start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), event[2].split(':')[0], event[2].split(':')[1], 0 ),
                    end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), event[3].split(':')[0], event[3].split(':')[1], 0 ),
                    location: event[5],
                    date: addDays(monday_date, event[8])
                }
                console.log(e)
                
                
                events.push(e)
            }
        })
    })
    
    
    
    
    return events
}

const getWeekData = async (page) =>{
    
    const monday_date = await page.evaluate(() => {
        function getMonthFromString(mon){
            return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1
        }
        let monday_date = document.getElementsByClassName('header-1-2-3')[0].textContent.split('-')[0].split(" ")
        let day = monday_date[0]
        let month = getMonthFromString(monday_date[1])
        let year = monday_date[2]
        return `${year}-${month}-${day}`
    });
    
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
    return formated_results(monday_date, result);
}


 const fetchData = async (id, password) => {
    
    
    const browser = await puppeteer.launch();
    
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.goto('https://teaching.brunel.ac.uk/teaching/SWS-2122/login.aspx');
    
    await page.type('[name=tUserName]', id);
    await page.type('[name="tPassword"]', password);
    await page.click('[type=submit]');
    console.log("User Logged In")
    await page.waitForTimeout(200)
    await page.click('a[id="LinkBtn_mystudentsettimetable"]')
    await page.waitForTimeout(150)
    await page.select('select[name="lbWeeks"]','1')
    await page.waitForTimeout(150)
    await page.select('select[name="dlType"]','TextSpreadsheet;swsurl;SWSCUST Object TextSpreadsheet')
    await page.waitForTimeout(150)
    await page.click('[type=submit]');
    await page.waitForTimeout(200)
    let year = []
    for(let i = 0; i< 35; i++){
        console.log("Fetched Week: "+i)
        let week = await getWeekData(page)
        if(week.length > 0){
            year.push(week)
        }
        // const promise = page.waitForNavigation({ waitUntil: 'networkidle2' });
        await page.click('a[id="bNextWeek"]')
        await page.waitForTimeout(150)

        // await promise;
    }
    console.log( year)
    let numLec = 0
    let cal = ical({domain: 'brunel.ac.uk', name: 'University Timetable'});
    year.forEach(week=> week.forEach(event=> {
        numLec++;
        cal.createEvent({...event})
    }))
    const fileID = uuidv4();
    cal.saveSync(`./calendars/${fileID}.ical`)
    console.log("You have " + year.length+" weeks of lectures & labs: " + numLec + " in total")
    
    // console.log(await page.content());
    
    await browser.close();
    return fileID
};


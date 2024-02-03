import express from "express"
import path from 'path'
import bodyParser from 'body-parser';
// import { PORT } from "./settings/conf.js";
import fs from "node:fs"
import { readFile } from 'node:fs/promises'

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//
// form body를 파싱함
//  
app.use(bodyParser.urlencoded({ extended: true }));

// 
// JSON body를 파싱함 - api server 에 필요함.
// 
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

// 
// 기본 로그
// 
app.use(function logs(req, res, next) {
  const log = {
    method: req.method,
    path: req.url,
  };
  // console.log(`[${new Date()}]`, JSON.stringify(log));
  // console.log(`[${new Date().toLocaleString()}]`, JSON.stringify(log));
  console.log(`[${getDateStr(new Date())}]`, JSON.stringify(log));
  next();
})

// 
// CORS 핸들 for api server
// 
// app.use(function cors(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
//   // res.header('Access-Control-Expose-Headers', 'Origin, X-Requested-With, Content-Type');
//   res.header('Access-Control-Allow-Headers', '*');
//   (req.method === 'OPTIONS') ? res.sendStatus(200) : next();
// })

// 
// static file 처리
// 
app.use('/public', express.static(__dirname + '/public'));
/** @TODOs src/public/home.html 파일을 보내기 0 -> express.static 기능 사용 */

// 
// view engine 설정
// 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')


/** @TODOs src/public/home.html 파일을 보내기 1 */
// app.get('/test/send-file', function (req, res) {
//   try {

//     const options = {
//       root: path.join(__dirname, "./public")
//     };

//     // const fileName = 'home.html';
//     const fileName = 'home.html';
//     res.sendFile(fileName, options, function (err) {
//       if (err) {
//         console.error('Error:', err);
//         res.send("404 NOT FOUND")
//         // res.send("<h1>404 NOT FOUND</h1>")
//       }
//     });
//   } catch (e) {
//     res.send(e.message)
//   }
// })

/** @TODOs src/public/home.html 파일을 보내기 1.2 */
// app.get('/test/send-file/:filename', function (req, res) {
//   try {
//     const fileName = req.params.filename

//     const options = {
//       root: path.join(__dirname, "./public")
//     };

//     res.sendFile(fileName, options, function (err) {
//       if (err) {
//         console.error('Error:', err);
//         res.send("404 NOT FOUND")
//         // res.send("<h1>404 NOT FOUND</h1>")
//       }
//     });
//   } catch (e) {
//     res.send(e.message)
//   }
// })

/** @TODOs src/public/home.html 파일을 보내기 2 */
// app.get('/test/send-file2/:filename', async function (req, res) {
//   try {
//     // res.send("<h1>Hello World</h1>")
//     const filePath = path.join(__dirname, "./public/"+req.params.filename)
//     const data = await readFile(filePath)
//     // console.log('data', data)
//     res.send(data.toString())
//   } catch (e) {
//     res.send("FILE NOT FOUND")
//   }
// })

/** @TODOs src/public/home.html 파일 보내기 3 */
// app.get('/test/stream/:filename', async function (req, res) {
//   try {
//     const filePath = path.join(__dirname, "./public/"+req.params.filename)
//     fs.createReadStream(filePath).pipe(res)
//   } catch (e) {
//     res.send("FILE NOT FOUND")
//   }
// })

// 
// 여기서 부터는 ejs 로 작성
// 


/** @TODOs src/public/home.html 파일 보내기 4 ejs 사용*/
app.get('/', async function (req, res) {
  res.render("index", {data: {fileType: "EJS File"}})
})

app.get('/menus', async function (req, res) {
  res.render("menus/index")
})

/** @TODO 회원 등록 */

/** @TODO 로그인 */

/** @TODO 메뉴 작성 */

/** @TODO 메뉴 보기 */

const PORT = "5050"
app.listen(PORT, () => {
  console.log("=".repeat(80));
  console.log(`  Test Server is listening on Port ${PORT}`);
  console.log("=".repeat(80));
});

function getDateStr(d) {
  let str = ""
  str += d.getFullYear()
  str += "/"+(d.getMonth()+1)
  str += "/"+d.getDate()
  str += " "+d.getHours()
  str += "."+d.getMinutes().toString().padStart(2, "0")
  str += "."+d.getSeconds()

  return str
}

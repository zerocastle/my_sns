var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    port: 3306,
    database: 'hoho'
});

//정적 파일 설정 : css , html , js 과 같은 파일 들
app.use(express.static(path.join(__dirname, 'public', 'www')));

app.use(bodyParser.json());

//한글이 안깨지도록 처리하는 부분
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'www', 'index.html'));
})

// 가입
app.post('/join', function (req, res) {
    var id = req.body.id;
    var pw = req.body.pw;
    console.log(req);
    var resData = "failed";

    var query = 'insert into member(mid,mpw) values(?,?);';
    //? : plcae holder

    connection.query(
        query,
        [id, pw], // place holder 대입 시킬 데이터를 배열로 전달
        function (err, result) {// SQL 실행후 결과를 위해 호출되는 콜백 함수
            if (!err) {
                resData = 'success';
            }
            res.send({ "result": resData });
        }
    );
});

// 로그인
app.post(
    '/login',
    function (req, res) {
        var inputId = req.body.id;
        var inputPw = req.body.pw;
        var resData = "failed";

        var query = 'select * from member where mid = ? and mpw = ?';
        var test = [inputId, inputPw];

        connection.query(
            query,
            test,
            function (err, rows, result) {
                if (err) {
                    resData = 'failed';
                } else if (!rows.length) {
                    resData = 'wrong'; // 로그인 실패
                } else {
                    resData = 'success';
                }
                res.send({ "result": resData });
            }

        );
    }
)

// 글 등록
app.post('/post', function (req, res) {
    var title = req.body.title;
    var content = req.body.content;
    var writer = req.body.mid;
    var resData = 'failed';

    var query = 'insert into post(??,??,??) values(?,?,?)';
    var param = ['ptitle', 'pcontent', 'pwriter', title, content, writer];

    connection.query(query, param, function (error, result) {
        if (!error) {
            resData = 'success';
        }
        res.send({ "result": resData });
    });

});

// 글목록 가져오기
app.post('/load', function (req, res) {
    var resData = 'failed';
    console.log("불러옴?");
    var query = "select * from post order by pwritedate desc";
    connection.query(query, function (error, rows, result) {
        if (!error) {
            resData = 'success';
        }
        res.send({ "result": resData, "data": rows });
    })


})

//댓글 목록 불러오기
app.post('/commentload', function (req, res) {
    console.log(req.body);
    var resData = 'failed';
    var pno = req.body.pno;
    var query = 'select * from comment where cparent = ? order by cno desc';
    var param = [pno]; // .게시글 번호에 댓글을 찾기위해
    connection.query(query, param,
        function (error, rows, result) {
            if (!error) {
                resData = "success";
            }
            res.send({"result" : resData,"data":rows});
        });
});

//댓글 작성하기
app.post('/commentPost', function (req, res) {
    var parent = req.body.parentId;
    var content = req.body.content;
    var writer = req.body.writer;
    var resData = 'failed';
    console.log(req.body);
    var query = 'insert into comment(??,??,??) values(?,?,?)';
    var param = ['cparent', 'ccontent', 'cwriter', parent, content, writer];

    connection.query(query, param, function (error, result) {
        if (!error) {
            resData = 'success';
        }
        console.log(error);
        res.send({ "result": resData, "lastId": result.insertId });
    });
});

// 댓글 삭제
app.post('/commentDel',function(req,res){
    var resData = 'failed';
    var postId = req.body.postId;
    var query = 'delete from comment where cno = ?';
    var param = [postId];
    connection.query(query,param,function(error,rows,result){
        if(!error){
            resData = 'success';
        }
        res.send({"result" : resData});
    })
})

//게시글 삭제
app.post('/Del',function(req,res){
    var resData = 'failed';
    var postId = req.body.postId;
    var query1 = 'delete from comment where cparent = ?'; // 게시글을 지우면 댓글도 지워야 하기때문
    var query2 = 'delete from post where pno = ?';
    var param = [postId];
    connection.query(query1,param,function(error,rows,result){
        if(!error){
            connection.query(query2,param,function(error,rows,result){
                if(!error){
                    resData = 'success';
                }
                res.send({"result" : resData});
            });
        }
    });
})

var server = app.listen(3000, function () {
    console.log('express server 실행 , http://localhost:3000/');
});
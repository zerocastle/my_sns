$(document).ready(function () {
    // 페이지가 로딩 될때 로그인 페이지를 온로드 한다.
    $('.Login').show();

    // 회원가입 버튼을 눌렀을때 
    $('.loginBtnJoin').click(function () {
        $('.Login').hide();
        $('.Join').show();
    });

   
    // 회원가입 취소 버튼
    $('.joinBtnCancel').click(function () {
        if (window.confirm('가입을 취소하시겠습니까?')) {
            $('.Join').hide();
            $('.Login').show();
        }
    });

    //회원 가입 처리할때의 ajax 요청
    $('.joinBtnJoin').click(function () {
        var id = $('.joinTxtID').val();
        var pw = $('.joinTxtPw').val();
        var pwc = $('.joinTxtpwc').val();

        if (!id) {
            window.alert('아이디를 입력하세요');
            return false;
        } else if (!pw) {
            window.alert('비밀번호를 입력하세요');
            return false;
        } else if (!pwc) {
            window.alert('비밀번호 재확인란에 입력하세요!');
            return false;
        } else if (pw != pwc) {
            window.alert('비밀번호가 일치하지 않습니다.');
            return false;
        }

        $.ajax({
            type: 'post',
            url: 'http://localhost:3000/join',
            headers: {  'Access-Control-Allow-Origin': 'http://localhost:3000/join' },
            data: {
                id: id,
                pw: pw
            },
            dataType: 'json',
            success: function (data) {
                console.log(data);
                if (data.result == "success") {
                    window.alert('회원가입 완료');
                    $('.Join').hide();
                    $('.Login').show();
                } else {
                    window.alert('오류 발생');
                }
            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    //로그인 처리
    var currentUser = null; // 로그인한 사용자 정보 저장
    var isLogin = false; // 로그인중인지 체크함

    $('.loginBtnLogin').click(function () {

        if (isLogin) return false; // 이미 로그인 중이면 false로 리턴하면서 종료
        var id = $('.loginTxtID').val();
        var pw = $('.loginTxtPw').val();

        if (!id) {
            window.alert('아이디를 입력하세요');
            return false;
        } else if (!pw) {
            window.alert('비밀번호를 입력하세요');
            return false;
        }
        isLogin = true; // 로그인 시도 시작

        $.ajax({
            type: 'post',
            url: 'http://localhost:3000/login',
            data: {
                id: id,
                pw: pw
            },
            dataType: 'json',
            success: function (data) {
                console.log(data);
                if (data.result == "success") {
                    window.alert('로그인 성공');
                    $('.Login').hide();
                    $('.Main').show();
                    $('.NaviPadding > p').html('안녕하세요, <b>' + id + '</b>님.');
                    currentUser = id; // 로그인하면 현재 아이디를 전역 변수 currentUser 로 넣어준다.
                    loadPosts(); // 로그인한 시점으로 게시글 정보를 들고온다.
                } else if (data.result == "wrong") {
                    alert('잘못된 아이디 또는 비밀번호를 입력했습니다.');
                } else {
                    alert('오류가 발생했습니다.');
                }
                isLogin = false;
            },
            error: function (error) {
                console.log(error);
                // Web Server error
                isLogin = false;
            }
        });
    });
    
    // 위에 달려 있는 부분에서 글쓰기 버튼을 누르면 수행함 
    $('.mainBtnWrite').click(function () {
        $('.Main').hide();
        $('.Write').show();
        $('.writeTxtSubject').val('');
        $('.writeTxtContent').val('');

    });

    // session 값이 없기에 그저 로그아웃을 누르면 reflash 되어 원래 로그인 창으로 돌아감
    $('.mainBtnLogout').click(function () {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            location.reload();
        }
    });


    /* 글쓰기 화면 */
    var isPost = false;//게시글 작성 중인지 체크하는 변수
    $('.writeBtnWrite').click(function () {
        //구현예정
        if (isPost) return false;
        var subject = $('.writeTxtSubject').val();
        var content = $('.writeTxtContent').val();
        if (!subject) {
            window.alert('글 제목을 입력해주세요');
            return false;
        }
        else if (!content) {
            window.alert('글 내용을 입력해주세요');
            return false;
        }
        if (window.confirm('글을 작성하시겠습니까?')) {
            isPost = true;
            $.ajax({
                type: "POST",
                url: 'http://localhost:3000/post',
                data: {
                    title: subject,
                    content: content,
                    mid: currentUser
                },
                dataType: 'json',
                success: function (data) {
                    if (data.result == "success") {
                        $('.Write').hide();
                        $('.Main').show();
                        loadPosts();
                    }
                    else {
                        window.alert('오류가 발생하였습니다.');
                    }
                    isPost = false;
                },
                error: function () {
                    window.alert('오류가 발생하였습니다.');
                    isPost = false;
                }
            });
        }
    });
    $('.writeBtnCancel').click(function () {
        if (window.confirm('작성을 취소하겠습니까?')) {
            $('.Write').hide();
            $('.Main').show();
            loadPosts();
        }
    });

    //게시글과 댓글을 불러와 화면에 출력하는 함수
    var loadPosts = function () {
        $('.Items').empty(); // Items.에 기존에 있던 가데이터를 날려버린다.
        //데이터를 AJAX로 불러옵니다.
        $.ajax({
            type: "POST",
            url: 'http://localhost:3000/load',
            data: {},
            dataType: 'json',
            success: function (data) {
                // 성공적으로 게시글을 불러들였들때 실행
                if (data.result == "success") {
                    var cnt = data.data.length;
                    console.log(data);
                    for (var i = 0; i < cnt; i++) {
                        var pno = data.data[i].pno; // 글 번호
                        var ptitle = data.data[i].ptitle; // 글제목
                        var pcontent = data.data[i].pcontent; // 글 내용
                        var pwriter = data.data[i].pwriter; // 게시글 작성자
                        var pwritedate = data.data[i].pwritedate; //게시글을 작성한 날짜

                        var item = $('<div></div>').attr('data-id', pno).addClass('Item'); // <div data-id="pno" class="Item"></div>을 만듬
                        var itemText = $('<div></div>').addClass('ItemText').appendTo(item); //위에서 만들어 놓은 거에  ItemText class 를 추가한 <div></div> 태그를 추가한다.
                        $('<h4></h4>').text(ptitle).appendTo(itemText);// itemText 에 추가 함
                        $('<h6></h6>').text('작성시간 : ' + pwritedate).appendTo(itemText); // itemText 에 추가 함
                        $('<p></p>').text(pcontent).appendTo(itemText); // itemText 에 추가 함
                        // 게시글을 작성한 사람과 지금 로그인 한 사람을 판단한다.
                        if (pwriter == currentUser) {
                            var itemButtons = $('<div></div>').addClass('ItemButtons').appendTo(itemText);
                            $('<button></button>').addClass('mainBtnDel AppBtnRed').text('삭제하기').appendTo(itemButtons);
                        }
                        //댓글
                        var comment = $('<div></div>').addClass('Comment').appendTo(item);
                        $('<input />').attr({ type: 'text', placaholder: '댓글입력...' }).addClass('itemTxtComment').appendTo(comment);
                        $('<button></button>').addClass('commentBtnWrite AppBtnBlue').text('댓글달기').appendTo(comment);
                        //댓글 목록이 출력되는 곳
                        $('<div></div>').addClass('Comments').appendTo(comment);

                        // 최종적으로 내가 만든 돔트리를 .Items class 태그가 있는 <div></div>에붙여 넣는다.
                        item.appendTo($('.Items'));
                        //댓글 불러오기
                        loadComment(pno);
                    }
                }
                else {
                    window.alert('오류가 발생하였습니다.');
                    $('.Main').hide();
                    $('.Login').show();
                }
            },
            error: function () {
                window.alert('오류가 발생하였습니다.');
                $('.Main').hide();
                $('.Login').show();
            }
        });
    };


    // 댓글작성
    var isComment = false;//댓글을 달고 있는지 확인하는 변수
    $(document.body).on('click', '.commentBtnWrite', function () {
        // 여기서 commentBtnWrite는 동적 선택자
        if (isComment) return false;
        var parentId = $(this).parent().parent().attr('data-id');
        var content = $(this).prev().val();
        var comments = $(this).next();//나중에 댓글을 추가할 comments  DOM을 불러옵니다.

        console.log(parentId);
        console.log(content);
        console.log(comments);

        if (!content) {
            window.alert('댓글을 입력하세요');
            return false;
        }
        isComment = true;
        $.ajax({
            type: "post",
            url: 'http://localhost:3000/commentPost',
            data: {
                parentId: parentId,
                content: content,
                writer: currentUser
            },
            dataType: 'json',
            success: function (data) {
                if (data.result == "success") {
                    var lid = data.lastId;
                    var commentItem = $("<div></div>").addClass('CommentItem').attr('data-id', lid);
                    $("<h4></h4>").text(currentUser).appendTo(commentItem);//댓글 작성자(현재 사용자)
                    $("<p></p>").text(content).appendTo(commentItem);//댓글 내용
                    $("<button></button>").addClass('AppBtnRed commentBtnDel').text('삭제').appendTo(commentItem);
                    commentItem.appendTo(comments);
                }
                else {
                    window.alert('오류가 발생하였습니다.');

                }
                isComment = false;
            },
            error: function (err) {
                window.alert("오류가 발생하였습니다.");
                console.log(err);
                isComment = false;
            }
        });
    });

    // 댓글 목록 불러오기
    var loadComment = function (pno) {
        if (!pno) return false;
        var target = $('div.Item[data-id=' + pno + '] .Comments'); //div class가 Item 이면서 Comments 면서 데이터를 가져온 해당 포스트 번호에 댓글을 추가한다.
        //데이터를 AJAX로 불러옵니다.
        $.ajax({
            type: "post",
            url: "http://localhost:3000/commentload",
            data: {
                pno: pno // 게시글에 댓글을 불러오기위해
            },
            dataType: "json",
            success: function (data) {
                if (data.result == "success") {
                    console.log('댓글 불러옴?');
                    console.log(data);
                    var cnt = data.data.length;
                    for(var i = 0; i < cnt; i++){
                        var id = data.data[i].cno;
                        var content = data.data[i].ccontent;
                        var writer = data.data[i].cwriter;
                        var cwritedate = data.data[i].cwritedate;
                        var commentItem = $('<div></div>').addClass('commentItem').attr('data-id',id);
                        $('<h4></h4>').text(writer).appendTo(commentItem);
                        $('<p></p>').text(content).appendTo(commentItem);
                        $('<button></button>').addClass('AppBtnRed commentBtnDel').text('삭제').appendTo(commentItem);
                        commentItem.appendTo(target);
                    }

                }else{
                    alert('오류가 발생 했습니다.');
                }
            },
            error : function(){
                alert('오류가 발생 했습니다.')
            }
        })
    }


    // 댓글 삭제
    $(document.body).on('click','.commentBtnDel',function(){
        if(window.confirm('댓글을 삭제 하겠습니까?')){
            var id = $(this).parent().attr('data-id');
            var removeTarget = $(this).parent();

            $.ajax({
                type : 'POST',
                url : 'http://localhost:3000/commentDel',
                data : {
                    postId : id
                },
                dataType : 'json',
                success : function(data){
                    if(data.result == 'success'){
                        removeTarget.remove();
                    }else{
                        alert('오류가 발생 했습니다.');
                    }
                },
                erorr : function(){
                    alert('오류가 발생 했습니다.');
                }
            })
        }
    })

    // 게시글 삭제
    $(document.body).on('click','.mainBtnDel',function(){
        if(window.confirm('삭제 하시겠습니까?')){
            var id = $(this).parent().parent().attr('data-id');
            var removeTarget = $(this).parent().parent().parent();

            $.ajax({
                type : 'post',
                url : 'http://localhost:3000/Del',
                data : {
                    postId : id 
                },
                dataType : 'json',
                success : function(data){
                    if(data.result == 'success'){
                        removeTarget.remove();
                    }else{
                        alert('오류가 발생 했습니다.');
                    }
                },
                error : function(){
                    alert('오류가 발생 했습니다.');
                }
            })
        }
    })



});
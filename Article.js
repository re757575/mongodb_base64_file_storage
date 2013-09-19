var MongoDb = require("mongodb"),
    ObjectID = MongoDb.ObjectID,
    db = new MongoDb.Db("ArticleDB", new MongoDb.Server("localhost", 27017, {
        auto_reconnect: true
    }, {})),
    fs = require("fs");

db.open(function(err, db) {});

exports.findAll = function(callback) {
    db.collection("articles", function(err, collection) {
        collection.find().toArray(callback);
    });
};

exports.findById = function(id, callback) {
    db.collection("articles", function(error, collection) {
        collection.findOne({
            _id: new ObjectID(id)
        }, callback);
    });
};

exports.save = function(input, myfile, callback) {


    input.date = new Date();
    if (input._id) {
        input._id = new ObjectID(input._id);
    }
    //console.log(myfile);

    if (myfile) {
        console.time('speed');
        var data = fs.readFileSync(myfile.path);
        console.log("讀取速度:");
        console.timeEnd('speed');



        //console.log(data);

        data = data.toString('base64');

        var jsonArry = [];
        var jsoObj = {}
        var result = [];
        var newstr = "";
        var slice = 2621440; // 每 2.5MB 個 chars 一段  
        for (var i = 0; i < data.length; i += slice)
            result[result.length] = data.substr(i, slice);

        for (var i = 0; i < result.length; i++) {
            newstr += result[i] + "";
        };

        console.log("檔案base64長度:" + data.length);
        console.log("陣列分割數:" + result.length);
        //console.log(result);
        console.log("是否相等:%s", newstr === data);


        // to json
        for (var i = 0; i < result.length; i++) {
            var obj = new Object();
            obj.value = result[i];
            jsonArry[i] = obj;
        }
        jsoObj.data = jsonArry;

        var base64data = new Buffer(JSON.stringify(jsoObj).toString("base64"));//先將Object 轉成string 型態才可以
        console.log(input.myfile);
        input.myfile = new MongoDb.Binary(base64data); 
        input.myfileType = myfile.type;
        input.myfileName = myfile.name;
        input.size = myfile.size;

        if (myfile.size > slice) {
            console.log("檔案大於2.5MB");
        }
        var infosize;
        myfile.size > 1024 * 1024 ? (infosize = (myfile.size / (1024 * 1024)).toFixed(2) + "MB") : (infosize = (myfile.size).toFixed(2) + "KB");
        console.log("/***************************檔案資訊***************************/");
        console.log("檔案名稱:" + myfile.name);
        console.log("檔案類型:" + myfile.type);
        console.log("檔案大小:" + myfile.size + "位元組 , " + infosize);
        console.log("上傳時間:" + new Date());
        //console.log(input.myfile);
        console.log("/****************************結束****************************/");

    }

    db.collection("articles", function(error, collection) {
        collection.save(input, {
            safe: true
        }, callback);
    });
};

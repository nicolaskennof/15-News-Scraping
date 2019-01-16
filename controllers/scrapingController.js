//Dependencies
var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");
var router = express.Router();

//MongoDB
var MONGODB = process.env.MONGODB || "mongodb://localhost/courrier_itl_DB";
mongoose.connect(MONGODB, { useNewUrlParser: true, useCreateIndex : true });

//Routing and functions
router.get("/", function (req, res) {
    db.Article.find({ saved: false })
        .then(function (found) {
            console.log("======================\n", found, "******************************");
            res.render("index", { page: "index", articles: found });
        })
        .catch(function (err) {
            console.log(err.message);
        })
});

router.get("/saved", function (req, res) {
    db.Article.find({ saved: true })
        .then(function (found) {
            res.render("savedArticles", { articles: found });
        })
        .catch(function (err) {
            console.log(err.message);
        })
});

router.get("/api/articleNotes/:id", function (req, res) {
    var id = req.params.id;
    db.Article.findOne({ _id: id }).populate("notes")
        .then(function (dbArticle) {
            res.json(dbArticle.notes);
        })
        .catch(function (err) {
            res.json(err);
        });
})

router.put("/api/saveArticle", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.body.id }, { saved: true }, { new: true }, function (err, updated) {
        if (updated) res.send("saved")
        else console.log(err.message);
    });
});

router.put("/api/saveNote", function (req, res) {
    var id = req.body.id;
    var note = req.body.note;

    db.Note.create({ body: note })
        .then(function (dbNote) {
            db.Article.findOneAndUpdate({ _id: id }, { $push: { notes: dbNote._id } }, { new: true }, function (err, updated) {
                if (updated) {
                    res.json(dbNote);
                } else {
                    res.json(err.message);
                }
            });
        })
        .catch(function (err) {
            res.send(err.message);
        })
});

router.put("/api/removeSavedArticle", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.body.id }, { saved: false }, { new: true }, function (err, updated) {
        if (updated) {
            res.send("removed");
        } else {
            console.log(err.message);
        }
    })
})

//Website scraping
router.get("/api/scrape", function (req, res) {
    axios.get("https://www.courrierinternational.com/monde").then(function (response) {
        var $ = cheerio.load(response.data);
        $("a article")
            .each(function (i, element) {
                var result = {};

                url = $(this)
                    .parent("a")
                    .attr("href");
                result.link = "https://www.courrierinternational.com" + url
                result.title = $(this)
                    .children("div")
                    .children("h2")
                    .text();
                imgSrc = $(this)
                    .children("div")
                    .children("img")
                    .attr("data-srcset")
                    .split(".jpg");
                result.img = imgSrc[0] + ".jpg";
                result.source = $(this)
                    .children("div")
                    .children("div")
                    .text();
                result.time = $(this)
                    .children("div")
                    .children("time")
                    .attr("datetime");
                result.saved = false;

                console.log(result)
                db.Article.create(result)
                    .then(function (dbArticle) {
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        console.log(err.message);
                    })
            });
        res.send("Scrape Complete");
    });

});

router.delete("/api/removeNote/:id", function (req, res) {
    var articleId = req.body.articleId;
    db.Note.findByIdAndDelete({ _id: req.params.id }, function (err, removed) {
        if (removed) {
            db.Article.updateOne({ _id: articleId }, { $pull: { notes: removed._id } }, function (err, done) {
                if (done) res.json(removed);
            })
        } else {
            res.json(err.message);
        }
    })
})

router.delete("/api/clearArticles", function (req, res) {
    db.Article.deleteMany({ saved: false })
        .then(function () {
            res.status(200).end();
        })
        .catch(function (err) {
            res.send(err.message);
        })
});

module.exports = router;
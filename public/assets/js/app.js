$(".scrapeNewsBtn").on("click", () => {
    $.get("/api/scrape", function (data) {
        location.reload("/");
    });
})

$(".saveArticleBtn").on("click", function () {
    var id = $(this).attr("data-id");

    $.ajax("/api/saveArticle", {
        type: "PUT",
        data: { id }
    }).then(
        data => {
            if (data === "saved") {
                bootbox.alert("Article saved!", () => {
                    location.reload("/");
                });
            }
        }
    );
});

$("#clearArticlesBtn").on("click", function () {
    $.ajax("/api/clearArticles", {
        type: "DELETE"
    }).then(
        function () {
            location.reload("/");
        }
    );
})

$(".notesBtn").on("click", function () {
    var id = $(this).attr("data-id");
    $.get("/api/articleNotes/" + id,
        function (notes) {
            notes.forEach(note => {
                addNewNote(note, id);
            });
            $("#saveNoteBtn").attr("data-id", id);
            $("#notes-modal").modal("toggle");
        });
})

function addNewNote(note, articleId) {
    var noteDiv = $(`<div data-id="${note._id}" style="margin-bottom:15px !important" class="noteContainer row ">`)
    var noteTextDiv = $('<div class="col-10">');
    var noteDeleteDiv = $('<div class="col-2">');;
    var noteText = $("<p>").text(note.body);
    var noteButton = $(`<button class="btn btn-danger deleteButton" data-article_id="${articleId}" data-id="${note._id}">X</button>`);
    noteTextDiv.append(noteText);
    noteDeleteDiv.append(noteButton);
    noteButton.on("click", function () {
        var id = $(this).attr("data-id");
        var articleId = $(this).attr("data-article_id");
        $.ajax("/api/removeNote/" + id, {
            data: { articleId },
            type: "DELETE"
        }).then(
            function (removed) {
                bootbox.alert("Note has been succesfully deleted!", () => {
                    $(`div [data-id="${removed._id}"]`).remove();
                });
            }
        );
    })
    noteDiv.append(noteTextDiv, noteDeleteDiv);
    $('#savedNotes').prepend(noteDiv);
}

$("#saveNoteBtn").on("click", function () {
    var note = $("#noteText").val();
    var id = $(this).attr("data-id");
    $.ajax("api/saveNote", {
        type: "PUT",
        data: {
            id,
            note
        }
    }).then(
        function (note) {
            if (typeof note === 'object') {
                bootbox.alert("Note saved!", function () {
                    $("#noteText").val('');
                    addNewNote(note, id);
                })
            } else {
                console.log(err);
            }
        }
    );
})

$(".deleteFromSaveBtn").on("click", function () {
    var id = $(this).attr("data-id");
    $.ajax("/api/removeSavedArticle", {
        type: "PUT",
        data: { id }
    }).then(
        function (data) {
            if (data === "removed") {
                bootbox.alert("Article removed from saved articles!", () => {
                    location.reload("/saved");
                })
            }
        }
    );
})

$(document).ready(function() {
    $(".menu-icon").on("click", function() {
          $("nav ul").toggleClass("showing");
    });
});

// Scroll

$(window).on("scroll", function() {
    if($(window).scrollTop()) {
          $('nav').addClass('black');
    }

    else {
          $('nav').removeClass('black');
    }
})
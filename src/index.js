var RAW_REPO_BASE_URL =
  "https://raw.githubusercontent.com/getify/You-Dont-Know-JS/master/";
var REPO_FILES_URL =
  "https://api.github.com/repos/getify/You-Dont-Know-JS/contents/";
var converter = new showdown.Converter();

var imageFileNames = [];
var markdownFiles = [];
var sortedMarkdownFiles = [];

var selectBookMenu = document.getElementById("selectbook");
var selectChapterMenu = document.getElementById("selectchapter");

//requestBookfolder(encodeURIComponent('up & going'));

selectChapterMenu.addEventListener("change", function(event) {
  var filename = event.target.value;

  var bookName = encodeURIComponent(selectBookMenu.value);

  console.log("selected book", bookName, "and file", filename);

  var getPromise = getOpenMdFilePromise(bookName, filename);

  getPromise
    .then(function(response) {
      var html = converter.makeHtml(response.data);
      html = injectImageUrlsIntoHtml(html, bookName);
      document.getElementById("content").innerHTML = html;
    })
    .catch(function(error) {
      console.log(error);
    });
});

selectBookMenu.addEventListener("change", function(event) {
  var foldername = event.target.value;

  console.log("selected", foldername);

  requestBookfolder(encodeURIComponent(foldername));
});

function requestBookfolder(encodeBookName) {
  axios
    .get(REPO_FILES_URL + encodeBookName)
    .then(function(response) {
      //console.log(response.data)

      imageFileNames = [];
      markdownFiles = [];

      for (var i = 0; i < response.data.length; i++) {
        if (RegExp(/.+\.(png|jpg)/).test(response.data[i].name)) {
          imageFileNames.push(response.data[i].name);
        }
        if (RegExp(/.+\.(md)/).test(response.data[i].name)) {
          markdownFiles.push(response.data[i].name);
        }
      }

      console.log(
        "files found img and md:",
        imageFileNames.length,
        markdownFiles.length
      );

      return getOpenMdFilePromise(encodeBookName, "README.md");
    })
    .then(function(response) {
      //console.log(response.data)

      var html = converter.makeHtml(response.data);
      html = injectImageUrlsIntoHtml(html, encodeBookName);

      document.getElementById("content").innerHTML = html;

      sortedMarkdownFiles = sortMarkdownFilesByOccurence(html);
      console.log("sorted", markdownFiles, sortedMarkdownFiles);

      selectChapterMenu.innerHTML = "";

      sortedMarkdownFiles.forEach(function(name) {
        var option = document.createElement("option");
        option.text = name;
        selectChapterMenu.add(option);
      });
    })
    .catch(function(error) {
      console.log(error);
    });
}

function getOpenMdFilePromise(encodeBookName, filename) {
  return axios.get(RAW_REPO_BASE_URL + encodeBookName + "/" + filename);
}

function injectImageUrlsIntoHtml(html, encodeBookName) {
  for (var j = 0; j < imageFileNames.length; j++) {
    var rawImageUrl =
      RAW_REPO_BASE_URL + encodeBookName + "/" + imageFileNames[j];
    html = html.replace(imageFileNames[j], rawImageUrl);
  }
  return html;
}

function sortMarkdownFilesByOccurence(html) {
  var indexedMdFiles = [];

  for (var k = 0; k < markdownFiles.length; k++) {
    var tempIndex = html.indexOf(markdownFiles[k]);

    //if (tempIndex >= 0) {
    var tempObj = {
      index: tempIndex,
      name: markdownFiles[k]
    };
    //console.log(tempObj)
    indexedMdFiles.push(tempObj);
    //}
  }

  return indexedMdFiles
    .sort(function(currElem, nextElem) {
      return currElem.index - nextElem.index;
    })
    .map(function(element) {
      return element.name;
    });
}

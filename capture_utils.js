let fs = require('graceful-fs');
let path = require('path');
let url = require('url');
let cheerio = require('cheerio');
let request = require('request');
let sanitize = require('sanitize-html');
let https = require('https');
let sh = require('shelljs');

const TESTING = 1;
let retries = 0;
let lastUse = null;


function getWebsite(websiteUrl, next){
  if(lastUse == null) lastUse = Date.now();
  if(Date.now() - lastUse > 100000){
    retries = 1;
  }
  let hostName = url.parse(websiteUrl).hostname;
  let rootDir = __dirname + path.sep;
  let pubDir = rootDir + 'public' + path.sep;
  let dlDir = pubDir + 'DL' + path.sep;
  let siteDLdir = dlDir + url.parse(websiteUrl).hostname + path.sep;
  let siteMain = siteDLdir + 'index.html';
  let cb = function() { return readAndSendFile(siteMain, next);};

  siteDL(siteDLdir, hostName, cb);

  let localContents = sh.ls('-RAl', `${__dirname}${path.sep}public`).toString();
  strSplit(localContents);




}

function siteDL(siteDLfolder, hostName, next){
  let dirname = siteDLfolder;
  if(!fs.existsSync(dirname)){
    sh.mkdir('-p',dirname);
  }
  sh.cd(dirname);
  sh.exec(`wget --recursive --mirror --timestamping -c --page-requisites -p -nc --html-extension -F --convert-links --restrict-file-names=windows --domains ${hostName} --no-parent --user-agent='Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.0.3) Gecko/2008092416 Firefox/3.0.3' --limit-rate=2M --random-wait -e robots=off ${hostName}.html`);
  setTimeout(next, 10000);
}

function readAndSendFile(siteMain, next){
  let fileName = siteMain;

  fs.readFileSync(fileName, 'utf8', function(err, data){
    if(err) {
      if(retries == 0) {

        console.error('Error reading the file. Trying again.');
        return readAndSendFile(siteMain, next);
      }else{
        throw new Error;
      }
    }
    next(data);

  });
}

function strSplit(str){
  let stArr = [];
  stArr = str.split(['(UTC)']);

  stArr.forEach(function(s){
    console.log(s);
  });
}

function getResources(website)
{
  request
    .get(website)
    .on('response', function(httpMessage){
      response.on('data', function(data){
        let $ = cheerio.load(data);
        let refs = $('[href]', '[src]').map(function(i, el){
          $e = cheerio.load(el);
          refVal = (t = $e.attr('href').text())? t : $e.attr('src').text();
          if(TESTING) {console.log(`GOT RESOURCE: raw ${el} returning ${refVal}`);}

          return refVal? refVal : null;
        }).get();
        downloadRefs(refs);
      })
    .on('error', function(err){
      console.error(err);
    })
    .on('end', function(){
      console.log(`Response from ${httpMessage.url} ended.\nSTATUS CODE: ${httpMessage.statusCode}, ${httpMessage.statusMessage}`);
      response.end();
    });

    }

    }
}


function downloadRefs(referecesArray){
  let counter = 1;
  referecesArray.each(function(ref){
    //Download all of them.
    console.log(`Preparing to download reference ${counter}: ${ref}`);
  }
}
function newSrcHandler(){}

function writeSrcFile(fileName, src, next){}



// Inner Function: scriptsManager
function scriptsManager(jQ)
{
  if(TESTING) {console.log('SCRIPTS: ');}
  let scripts =[];
  let srcs    = [];

  jQ('script').each(function(i, el){
    let src = cheerio(el).attr('src');
    if(!src){
      scripts.push(cheerio(el).html());
    }else { srcs.push(src);}

    if(TESTING) { console.log(`script${i+1}: ${(src)? srcs[(srcs.length - 1)] : scripts[(scripts.length -1)]}`);}
  });
  return {'scripts': scripts, 'srcs': srcs};
}


  // Inner Function: stylesManager
function stylesManager(jQ){
  if(TESTING){ console.log('STYLES: ');}

  let links = [];
  let styles = [];

  jQ('link').each(function(i, el){
    let l = jQ(this).attr('href');
    if(TESTING) { console.log(`link${i}: ${l}`);}

    links.push(l);
  });

  jQ('style').each(function(i, el){
    let e = jQ(this).html();
    if(TESTING) { console.log(`style${i}: ${e} `);}
    styles.push(e);
  });

  return {'links': links, 'styles': styles};
}


  // Inner Function imagesManager
function imagesManager(jQ){
  if(TESTING) { console.log('IMAGES: '); }
  let imageRefs = [];

  jQ('img').each(function(i, el){
    let e = cheerio(el).attr('src');
    if(TESTING) { console.log(`Image${e}: ${cheerio(e).html()}`);}
    imageRefs.push(cheerio(e).html());
  });

  return {'imageRefs': imageRefs};
}




function cleanUp(){
  sh.rm('-rf', 'app/public/DL/undefined*');
  sh.rm('-rf', 'app/public/undefined*');
  sh.rm('-rf', 'app/public/slate.law');
}
module.exports = getWebsite;

let fs = require('graceful-fs');
let path = require('path');
let url = require('url');
let cheerio = require('cheerio');
let request = require('request');
let sanitize = require('sanitize-html');
let https = require('https');
let readStream = require('stream').Readable;
let sh = require('shelljs');

const TESTING = 1;


function getWebsite(websiteUrl, next){
  Object.defineProperty(this, 'lastly', next);
  let hostName = url.parse(websiteUrl).hostname;
  Object.defineProperty(this, 'hostName', {
    value: hostName,
    writeable: false,
    enumerable: true,
    configurable: false
  });
  if(TESTING){ console.log(`At getWebste, next is ${next.name}:\n\t${next.toString()}`);}
  siteDL(websiteUrl);
}


function siteDL(siteUrl){
  let saveDir = `${__dirname}${path.sep}${this.hostName}${path.sep}index.html`;
  if(TESTING) {console.log(`Hostname has value: ${this.hostName}\n`);}
  let next = resourceHandler.bind(undefined, saveDir);
  dlResource(siteUrl, next);
}

function dlResource(resourceUrl, next){
  request.get(resourceUrl)
    .on('error', function(err){
      console.error(`Request for ${resourceUrl} failed with:\n${err}`);
    })
    .on('response', function(response){
      let data = '';
      console.log(`Response from ${resourceUrl}:\nResponse Code: ${response.statusCode}\nMessage: ${response.statusMessage}`);
      response.on('data', function(chunk){
        console.log(`Recieved another chunk of data from ${resourceUrl}.`);
        data += chunk;
      })
        .on('end', function(){
          //debugger //eslint-disable-line
          console.log(`Finished getting data from ${resourceUrl}. Sending to ${ next.name }.`);
          next(data);
        });

    });

}

function readAndSendFile(siteMain, next){
  let fileName = 'index.html';
  let dirName = `${__dirname}${siteMain}${path.sep}`;

  fs.readFileSync(dirName+fileName, 'utf8', function(err, data){
    if(err) {
      console.error(`Error Reading File: ${err}`);
    }
    next(data);

  });
}



function resourceHandler(saveTo, html)
{
  debugger //eslint-disable-line
  if(TESTING) {console.log(`From resourceHandler: \n\tsaveto: ${saveTo}\n\tCalled By: ${this.name } `);}
  let imagesD = `${saveTo}${path.sep}images`;
  let styleSheet = `${saveTo}${path.sep}${this.hostName}.css`;
  let scriptsD = `${saveTo}`;
  [imagesD, scriptsD].forEach(function(loc){
    if(!fs.existsSync(loc)){
      sh.mkdir('-p', loc);
    }
  });

  Object.defineProperty(this, 'imagesD', {
    value: imagesD
  });


  writeFile(`${saveTo}.b.html`, html, function(saveTo){console.log(`Wrote Initial Downloaded Version of file: ${this.hostName} to ${saveTo}`);});

  let smC = imagesManager.bind(undefined, cheer(html), imagesD, this.lastly);
  let smB = stylesManager.bind(undefined, cheer(html), styleSheet, smC);
  let smA = scriptsManager.call(undefined, cheer(html), scriptsD, smB);


  Object.defineProperty(resourceHandler, 'name'
      ,{  __proto__: null,
              value: 'resourceHandler'}); //eslint-disable-line
              //debugger //eslint-disable-line
}

function reWriteHtml(html, saveTo){
  let $ = cheerio.load(html);
  let hostName = this.hostName;

  $(":contains('"+ this.hostName + "')").each(function(str, i){//eslint-disable-line
    this.text(String.prototype.replace(hostName, `file://${saveTo}`));
  });

  writeFile(saveTo, $.html(), renderLocalVersion(saveTo));
}

function cheer(html){
  return cheerio.load(html);
}



function writeFile(saveTo, content, next){
  debugger //eslint-disable-line
  fs.writeFile(saveTo, content, function(err){
    if(err){
      console.error(`Error: Unable to write file: ${saveTo}.\nDetails: ${err}`);
      throw new Error(err);
    }
    console.log(`Wrote file successfully to ${saveTo}.`);
    next();
  });
}

function renderLocalVersion(fileLocation){

}

function downloadRefs(referencesArray){
  console.log(`ReferencesArray: ${referencesArray}`);
  referencesArray.forEach(function(ref, counter){
    //Download all of them.
    console.log(`Preparing to download reference ${counter +1}: ${ref}`);
  });
}



// Inner Function: scriptsManager
function scriptsManager(jQ, saveTo, then)
{
  if(TESTING) {console.log('SCRIPTS: ');}
  let scripts =[];
  let srcs    = [];
  let cleanedSave;
  if(saveTo.match(/\w(.html)$/)){
    cleanedSave = saveTo.replace(/(html)$/, 'js');
  }
  jQ('script').each(function(i, el){
    let src = cheerio(el).attr('src');
    if(!src){
      scripts.push(cheerio(el).html());
    }else { srcs.push(src);}

    if(TESTING) { console.log(`script${i+1}: ${(src)? srcs[(srcs.length - 1)] : scripts[(scripts.length -1)]}`);}
  });

  let complete = '';
  scripts.forEach(function(script){
    complete += `\n<script>\n${script}\n</script>\n`;
  });
  //debugger //eslint-disable-line

  let cleanedSrcs = [];
  srcs.forEach(function(s){
    if(!s.match(/^[https://]{1}\w/)){
      let n = `https://${this.hostName}${path.sep}${s}`;
      cleanedSrcs.push(n);
    }else {
      cleanedSrcs.push(s);
    }
  });

  dlAndCat(cleanedSrcs, complete, cleanedSave? cleanedSave : saveTo, then);
}

function dlAndWrite(resourceUrls, saveTo, then){
  let b, to;
  let tos, bs = [];
  debugger //eslint-disable-line

  resourceUrls.forEach(function(resource, i){
    if(!resource.match(/^(http)\w/)){
      let fixed = `https://${this.hostName}/${resource}`;
      resourceUrls[i] = fixed;
    }
    b = `${path.parse(resource).base}`;
    to = `${saveTo}${path.sep}${b}`;
    tos.push(to);
    bs.push(b);

  });

  if(TESTING) {bs.forEach((e,m)=> {console.log(`Preparing to download ${e} to ${tos[m]}.`);});}
  while(resourceUrls.length > 0){
    let base = bs.pop();
    let savePath = tos.pop();
    let resUrl = resourceUrls.pop();
    if(TESTING) {console.log(`Verify these remain ordered -- \n\tBase: ${base}\n\tSavePath: ${savePath}\n\tURL: ${resUrl}`);}
    if(resourceUrls.length === 0){
      let cb = writeFile.bind(undefined, savePath);
      cb = Object.defineProperty(cb, 'writeFileThen', {
        __proto__: writeFile,
        value    : this.then
      });
      dlResource(resUrl, function(data){
        console.log(`Sent ${base} to ${savePath}, and \npassed control to ${then.name}`);
        return writeFile(savePath, data);
      });
    }else{
      dlResource(resUrl,  (data)=>{writeFile(data);});
    }
  }
}

function dlAndCat(resourceUrls, addTo, saveTo, then){
  if(TESTING) { console.log(`From dlAndCat: \n\tsaveTo: ${saveTo} \n\tresourceUrls: ${resourceUrls}`);}
  if(resourceUrls.length === 0){
    debugger //eslint-disable-line
    return writeFile(saveTo, addTo, then);
  }
  let resource = resourceUrls.pop();
  dlResource(resource, function(html){
    addTo = `\n\n<script>${html}\n</script>\n\n${addTo}`;
    return dlAndCat(resourceUrls, addTo, saveTo, then);
  });
}


  // Inner Function: stylesManager
function stylesManager(jQ, saveTo, next){
  debugger //eslint-disable-line
  if(TESTING){ console.log('STYLES: ');}
  let cssFile = `${saveTo}${path.sep}index.css`;
  let icons = [];
  let styles = [];


  jQ('link').each(function(i, el){
    let l = cheerio(this).attr('href').toString();

    if(TESTING) { console.log(`found: ${i}: ${l}`);}

    filterStyles(l)? styles.push(l) : icons.push(l);
  });


  dlAndWrite(styles, saveTo, next);
  dlAndWrite(icons, this.imagesD, function(){console.log(`Downloaded ${icons.toString}\n`);});


}

function filterStyles(fileName){
  if(fileName.toString().match(/\w(.css)$/)) return true;
  return false;
}

  // Inner Function imagesManager
function imagesManager(jQ, saveTo, next){
  debugger //eslint-disable-line
  if(TESTING) { console.log('IMAGES: '); }
  let imageRefs = [];

  jQ('img').each(function(i, el){
    let e = cheerio(el).attr('src');
    if(TESTING) { console.log(`Image${e}: ${cheerio(e).html()}`);}
    imageRefs.push(cheerio(e).html());
  });

  return {'imageRefs': imageRefs};
}

module.exports = getWebsite;

{

// Inner Function: scriptsManager
  let scriptsManager = function(jq)
  {
    if(TESTING) console.log("SCRIPTS: ");
    let scripts =[],
        srcs    = [];
    
    jq('script').each(function(i, el){
      let script = cheerio(el).html();
      
        let src = cheerio(el).attr('src');        
        if(!src){
            scripts.push(el);
          }else { srcs.push(el)}
      
      if(TESTING) console.log(`script${i+1}: ${(src)? srcs[(srcs.length - 1)] : scripts[(scripts.length -1)]}`);
    })
    return {scripts, srcs};
  }
  
  
  // Inner Function: stylesManager
  let stylesManger = function(jq){
    if(TESTING) console.log("STYLES: ");
    
    let links = [],
        styles = [];
    
    jq('link').each(function(i, el){
      if(TESTING) console.log(`link${i}: ${el}`);
      
      links.push(el);
    })
    
    jq('style').each(function(i, el){
      if(TESTING) console.log(`link${i}: ${el}`)
    })
  }
  
  
  // Inner Function Runner
  // rrq: resource requested
  let resourceRunner = function(jQ, rrq){
    if(TESTING) console.log(`${rrq.toUpperCase()}S: `)
    
    let requested = (Array.isArray(rrq))? rrq : (new Array).push(rrq);
    
    rrq.each(function(resource){
      
      
      
    })
    
  }

'use strict';

module.exports = class htmlWebpackReplace {
  constructor(options){
    this.options = Array.isArray(options) ? options : [options];
    this.options.forEach(opt => {
      if(typeof opt.pattern === 'undefined' || typeof opt.replacement === 'undefined'){
        throw new Error('Both `pattern` and `replacement` options must be defined!');
      }
    });
  }
  
  replace(html){
    this.options.forEach(opt => {
      if(typeof opt.replacement === 'function'){
        let matches = null;
        let isPatternValid = true;

        try{
          new RegExp(opt.pattern);
        }catch(e){
          isPatternValid = false;
        }
        
        if(!isPatternValid) throw new Error("Invalid `pattern` option provided, it must be a valid regex.");
       
        while((matches = opt.pattern.exec(html)) != null){
          html = html.replace(matches[0], opt.replacement.apply(null, matches));
        }

      }else{
        html = html.split(opt.pattern).join(opt.replacement);
      }
    });
    return html;
  }

  apply(compiler){
    if(compiler.hooks){
      compiler.hooks.compilation.tap('HtmlWebpackReplace', compilation => {
        compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync('html-webpack-plugin-before-html-processing', (data, callback) => {
          data.html = this.replace(data.html);
          callback(null, data);
        })
      })
    };
  }
}

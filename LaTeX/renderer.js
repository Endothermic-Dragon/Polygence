#! /usr/bin/env -S node -r esm

/*************************************************************************
 *
 *  component/tex2svg
 *
 *  Uses MathJax v3 to convert a TeX string to an SVG string.
 *
 * ----------------------------------------------------------------------
 *
 *  Copyright (c) 2019 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */


async function render(latex){
    //
    //  The default TeX packages to use
    //
    const PACKAGES = 'base, autoload, require, ams, newcommand, textmacros, color';

    //
    //  Get the command-line arguments
    //
    var argv = require('yargs')
        .demand(0).strict()
        .usage('$0 [options] "math" > file.svg')
        .options({
            inline: {
                boolean: true,
                describe: "process as inline math"
            },
            em: {
                default: 16,
                describe: 'em-size in pixels'
            },
            ex: {
                default: 8,
                describe: 'ex-size in pixels'
            },
            width: {
                default: 80 * 16,
                describe: 'width of container in pixels'
            },
            packages: {
                default: PACKAGES,
                describe: 'the packages to use, e.g. "base, ams"; use "*" to represent the default packages, e.g, "*, bbox"'
            },
            css: {
                boolean: true,
                describe: 'output the required CSS rather than the HTML itself'
            },
            fontCache: {
                boolean: true,
                default: true,
                describe: 'whether to use a local font cache or not'
            },
            assistiveMml: {
                boolean: true,
                default: false,
                describe: 'whether to include assistive MathML output'
            },
            dist: {
                boolean: true,
                default: true,
                describe: 'true to use webpacked version, false to use MathJax source files'
            }
        })
        .argv;

    //
    // Configure MathJax
    //
    MathJax = {
        options: {
            enableAssistiveMml: argv.assistiveMml
        },
        loader: {
            paths: {mathjax: 'mathjax-full/es5'},
            source: (argv.dist ? {} : require('mathjax-full/components/src/source.js').source),
            require: require,
            load: ['adaptors/liteDOM', '[tex]/textmacros', '[tex]/color']
        },
        tex: {
            packages: argv.packages.replace('\*', PACKAGES).split(/\s*,\s*/)
        },
        svg: {
            fontCache: (argv.fontCache ? 'local' : 'none'),
            mtextInheritFont: false,
            mtextFont: ["STIX General"]
        },
        startup: {
            typeset: false
        }
    }

    //
    //  Load the MathJax startup module
    //
    require('mathjax-full/' + (argv.dist ? 'es5' : 'components/src/tex-svg') + '/tex-svg.js');

    //
    //  Wait for MathJax to start up, and then typeset the math
    //
    let returnVal;
    await MathJax.startup.promise.then(() => {
        MathJax.tex2svgPromise(latex, {
            display: !argv.inline,
            em: argv.em,
            ex: argv.ex,
            containerWidth: argv.width
        }).then((node) => {
            const adaptor = MathJax.startup.adaptor;
            //
            //  If the --css option was specified, output the CSS,
            //  Otherwise, output the typeset math as SVG
            //
            if (argv.css) {
                returnVal = adaptor.textContent(MathJax.svgStylesheet());
            } else {
                returnVal = adaptor.outerHTML(node);
            }
        });
    }).catch(err => console.log(err));

    return returnVal
}

exports.render = render;
'use strict'
{
    chrome.tabs.query({}, async(tabs)=>{
        function makeHtml(tabs) {
            const html = document.createElement('html');
            const head = document.createElement('head');
            const body = document.createElement('body');
            head.append(makeStyle(), makeScript());
            body.append(makeH1(), makeSummary(tabs.length), makeUl(tabs));
            html.append(head, body);
            return html;
        }
        function makeH1() {
            const h1 = document.createElement('h1');
            h1.textContent = 'Chrome Tabs';
            return h1;
        }
        function makeSummary(count) {
            const table = document.createElement('table');
            const span = document.createElement('span');
            span.id = 'chrome-tabs-count';
            span.textContent = `${count}`;
            const time = document.createElement('time');
            const dts = getDateString();
            time.id = 'create-at';
            time.setAttribute('datetime', dts);
            time.textContent = dts;
            table.append(
                makeTr('件数', span),
                makeTr('日時', time),
            );
            return table;
        }
        function getDateString() {
            const dt = new Date();
            const pads = [dt.getMonth()+1, dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds()].map(n=>pad(n));
            return `${dt.getFullYear()}-${pads[0]}-${pads[1]}T${pads[2]}:${pads[3]}:${pads[4]}`
        }
        function pad(i) {return `${i}`.padStart(2, '0');}
        function makeTr(head, data) {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            const td = document.createElement('td');
            th.append(head);
            td.append(data);
            tr.append(th,td);
            return tr;
        }
        function makeUl(tabs) {
            const ul = document.createElement('ul');
            ul.id = 'chrome-tabs-ul';
            ul.append(...tabs.map(tab=>makeLi(tab)));
            return ul;
        }
        function makeLi(tab) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            const span = document.createElement('span');
            const img = document.createElement('img');
            span.textContent = tab.title;
            img.src = tab.favIconUrl;
            img.width = '16';
            img.height = '16';
            a.href = tab.url;
            a.append(img, span);
            li.append(a);
            return li;
        }
        function makeStyle() {
            const style = document.createElement('style');
            style.textContent = `
                #chrome-tabs-ul li a{
                    display: inline-block;
                    width: 100%;
                    color:black;
                    background-color:white;
                }
                #chrome-tabs-ul li a:hover{
                    display: inline-block;
                    width: 100%;
                    color:white;
                    background-color:black;
                }
                `;
            return style;
        }
        function makeScript() {
            const script = document.createElement('script');
            script.textContent = `
window.addEventListener('DOMContentLoaded', async(event)=>{
    // li要素数の表示を更新する
    const lis = [...document.querySelectorAll(\`#chrome-tabs-ul li\`)];
    const span = document.querySelector(\`#chrome-tabs-count\`);
    span.textContent = '' + lis.length;
});
`;
            return script;
        }
        function downloadHtmlFile(html, fileName='chrome-tabs.html') {
            const blob = new Blob([html], {type:'text/plain'});
            const objectUrl = (window.URL || window.webkitURL).createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = fileName;
            a.click();
        }
        function getFormatText(formatType) {
            const formats = {
                html: `<a href="{{url}}" target="_blank" rel="noopener noreferre"><img src="{{favIconUrl}}" width="16" height="16">{{title}}</a>`,
                markdown: `[![0]({{favIconUrl}}){{title}}]({{url}})`,
                csv: `{{url}},{{title}},{{favIconUrl}}`,
                tsv: `{{url}}	{{title}}	{{favIconUrl}}`,
                free: `{{title}}	{{url}}	{{favIconUrl}}`,
            }
            if ('html markdown csv tsv free'.split(' ').some(v=>v===formatType)) {return formats[formatType]}
            else {throw new TypeError(`formatType=${formatType}は対象外です。`)}
        }
        function makeFormatText() {
            document.getElementById('tab-count').textContent = `${tabs.length}`;
        }
        document.getElementById('tab-count').textContent = `${tabs.length}`;

        document.getElementById('download').addEventListener('click', (event) => {
            const html = makeHtml(tabs);
            downloadHtmlFile(html.outerHTML);
        });
        document.getElementById('copy').addEventListener('click', async(event) => {
            function oldCopy(textArea) {
                textArea.select();
                document.execCommand("copy");
                textArea.setSelectionRange(0, 0);
            }
            async function newCopy(text) {
                try {await navigator.clipboard.writeText(text)}
                catch (err) {console.error('テキストのコピーに失敗しました: ', err)}
            }
            // とりあえずHTMLで固定
            const html = makeHtml(tabs);
            const text = html.outerHTML;
            const content = document.querySelector(`#content`);
            console.log(text);
            console.log(content);
            content.value = text;
                 if (navigator.clipboard) {await newCopy(text);content.style.display='none';alert('API');}
            else if (document.queryCommandSupported('copy')) {oldCopy(content);content.style.display='none';alert('execCommand');}
            else {
                content.select();
                document.querySelector(`#error-msg`).textContent = '自動コピーできませんでした。手動でコピーしてください。'
            }
        });
        document.getElementById('format-type').addEventListener('input', (e) => {
            e.target.value
            document.getElementById('format').textContent = `${tabs.length}`;
            
        });

        const html = makeHtml(tabs);
        downloadHtmlFile(html.outerHTML);
    });
}


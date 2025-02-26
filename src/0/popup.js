'use strict'
{
    chrome.tabs.query({}, async(tabs)=>{
        function makeHtml(tabs, dt) {
            const html = document.createElement('html');
            const head = document.createElement('head');
            const body = document.createElement('body');
            head.append(makeStyle(), makeScript());
            body.append(makeH1(), makeSummary(tabs.length, dt), makeUl(tabs));
            html.append(head, body);
            return html;
        }
        function makeH1() {
            const h1 = document.createElement('h1');
            h1.textContent = 'Chrome Tabs';
            return h1;
        }
        function makeSummary(count, dt) {
            const table = document.createElement('table');
            const span = document.createElement('span');
            span.id = 'chrome-tabs-count';
            span.textContent = `${count}`;
            const time = document.createElement('time');
            const dts = getDateString(dt);
            time.id = 'create-at';
            time.setAttribute('datetime', dts);
            time.textContent = dts;
            table.append(
                makeTr('件数', span),
                makeTr('日時', time),
            );
            return table;
        }
        function getTimeStamp(dt) {
            const pads = [dt.getMonth()+1, dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds()].map(n=>pad(n));
            return `${dt.getFullYear()}${pads[0]}${pads[1]}${pads[2]}${pads[3]}${pads[4]}`
        }
        function getDateString(dt) {
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
        function downloadHtmlFile(html, dt, fileName='chrome-tabs', withoutTimestamp=false) {
            const blob = new Blob([html], {type:'text/plain'});
            const objectUrl = (window.URL || window.webkitURL).createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = fileName + '-' + getTimeStamp(dt) + '.html';
            a.click();
        }
        document.getElementById('tab-count').textContent = `${tabs.length}`;
        document.getElementById('download').addEventListener('click', async(event) => {
            const dt = new Date();
            const html = makeHtml(tabs, dt);
            downloadHtmlFile(html.outerHTML, dt);
        });
        document.getElementById('copy').addEventListener('click', async(event) => {
            function oldCopy(textArea) {
                textArea.select();
                document.execCommand('copy');
                textArea.setSelectionRange(0, 0);
            }
            async function newCopy(text) {
                try {await navigator.clipboard.writeText(text)}
                catch (err) {console.error('テキストのコピーに失敗しました: ', err)}
            }
            function errMsg(msg) {document.querySelector(`#error-msg`).textContent = msg;}
            const html = makeHtml(tabs, new Date());
            const text = html.outerHTML;
            const content = document.querySelector(`#content`);
            console.log(text);
            console.log(content);
            content.value = text;
                 if (navigator.clipboard) {await newCopy(text);errMsg('');}
            else if (document.queryCommandSupported('copy')) {oldCopy(content);errMsg('');}
            else {
                content.select();
                errMsg('自動コピーできませんでした。手動でコピーしてください。');
            }
        });
        console.log(tabs);
//        document.getElementById('download').dispatchEvent(new Event('click'));
//        document.getElementById('download').dispatchEvent(new Event('copy'));
    });
}


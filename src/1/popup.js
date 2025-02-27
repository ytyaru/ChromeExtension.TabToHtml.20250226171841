'use strict'
{
    chrome.tabs.query({}, async(tabs)=>{
        function getTimeStamp(dt) {
            const pads = [dt.getMonth()+1, dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds()].map(n=>pad(n));
            return `${dt.getFullYear()}${pads[0]}${pads[1]}${pads[2]}${pads[3]}${pads[4]}`
        }
        function getDateString(dt) {
            const pads = [dt.getMonth()+1, dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds()].map(n=>pad(n));
            return `${dt.getFullYear()}-${pads[0]}-${pads[1]}T${pads[2]}:${pads[3]}:${pads[4]}`
        }
        function pad(i) {return `${i}`.padStart(2, '0');}
        function downloadFile(content, dt, ext='html', fileName='chrome-tabs', withoutTimestamp=false) {
            const blob = new Blob([content], {type:'text/plain'});
            const objectUrl = (window.URL || window.webkitURL).createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = fileName + (withoutTimestamp ? '' : `-${getTimeStamp(dt)}`) + `.${ext}`;
            a.click();
        }
        function getFormatText(formatType) {
            const formats = {
                html: `<li><a href="{{url}}" target="_blank" rel="noopener noreferre"><img src="{{favIconUrl}}" width="16" height="16">{{title}}</a></li>`,
                md: `* [![0]({{favIconUrl}}){{title}}]({{url}})`,
                csv: `{{url}},{{title}},{{favIconUrl}}`,
                tsv: `{{url}}	{{title}}	{{favIconUrl}}`,
                txt: `{{title}}	{{url}}	{{favIconUrl}}`,
            }
            if ('html md csv tsv txt'.split(' ').some(v=>v===formatType)) {return formats[formatType]}
            else {throw new TypeError(`formatType=${formatType}は対象外です。`)}
        }
        function makeFormatText() {
            document.getElementById('tab-count').textContent = `${tabs.length}`;
        }
        function makeTabText(tab, format) {return format.replace(/{{title}}/g, tab.title).replace(/{{url}}/g, tab.url).replace(/{{favIconUrl}}/g, tab.favIconUrl)}
        function makeHtmlHeader(count, dt) {
            const dts = getDateString(dt);
            return `<h1>Chrome Tabs</h1>
<table>
  <tr><th>件数</th><td id="chrome-tabs-count">${count}</td></tr>
  <tr><th>日時</th><td><time id="create-at" datetime="${dts}">${dts}</time></td></tr>
</table>
`
        }
        function makeContent(tabs, dt) {
            const formatType = document.getElementById('format-type').value;
            const format = getFormatText(formatType);
            const tabTexts = tabs.map(tab=>makeTabText(tab, format));
            return (('html'===formatType) ? makeHtmlHeader(tabs.length, dt) + '<ul id="chrome-tabs-ul">': '') + tabTexts.join('\n') + (('html'===formatType) ? '</ul>' : '')
        }
        document.getElementById('tab-count').textContent = `${tabs.length}`;

        document.getElementById('download').addEventListener('click', (event) => {
            const dt = new Date();
            const meta = `<!DOCTYPE html>
<meta charset="UTF-8">
<title>Chrome Tabs</title>
`;
            const style = `<style>
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
</style>`;
            const js = `<script>
window.addEventListener('DOMContentLoaded', async(event)=>{
    // li要素数の表示を更新する
    function updateCount() {
        const lis = [...document.querySelectorAll(\`#chrome-tabs-ul li\`)];
        const span = document.querySelector(\`#chrome-tabs-count\`);
        span.textContent = '' + lis.length;
        console.log('updated count!', lis.length);
    }
    const target = document.getElementById('chrome-tabs-ul');
    const observer = new MutationObserver(records=>updateCount());
    observer.observe(target, {
        subtree: true,
        childList: true,
        attributes: true,
    });
    updateCount();
});
</script>`;
            const content = meta + style + makeContent(tabs, dt) + js;
            document.getElementById('content').value = content;
            downloadFile(content, dt, document.getElementById('format-type').value)
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
            const content = document.querySelector(`#content`);
            const text = makeContent(tabs, new Date());
            content.value = text;
            console.log(text);
            console.log(content);
            content.value = text;
                 if (navigator.clipboard) {await newCopy(text);}
            else if (document.queryCommandSupported('copy')) {oldCopy(content);}
            else {
                content.select();
                document.querySelector(`#error-msg`).textContent = '自動コピーできませんでした。手動でコピーしてください。'
            }
        });
        document.getElementById('format-type').addEventListener('input', (e) => {
            const ta = document.getElementById('format');
            ta.value = getFormatText(e.target.value);
        });
        document.getElementById('format-type').dispatchEvent(new Event('input'));
//        document.getElementById('download').dispatchEvent(new Event('click'));
//        document.getElementById('download').dispatchEvent(new Event('copy'));
    });
}


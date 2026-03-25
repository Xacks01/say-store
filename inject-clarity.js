const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/Lenovo/Downloads/Say-entertainment';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const clarityScript = `
    <!-- Microsoft Clarity -->
    <script type="text/javascript">
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "YOUR_CLARITY_PROJECT_ID");
    </script>
</head>`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Only inject if it doesn't already exist
    if (!content.includes('Microsoft Clarity')) {
        content = content.replace('</head>', clarityScript);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Injected Clarity into ${file}`);
    } else {
        console.log(`Clarity already exists in ${file}`);
    }
});

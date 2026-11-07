const fs = require('fs');
const html = fs.readFileSync('landing-handoff-2026-11-07/landing-editable(수정).html', 'utf8');

const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let bodyContent = bodyMatch ? bodyMatch[1] : '';

bodyContent = bodyContent.replace(/<script id="landing-local-editor-script">[\s\S]*?<\/script>/i, '');

// Since Vue complains about unclosed tags sometimes, let's just make sure
// the html is valid. The user's HTML is generally valid.
// Also fix asset paths if necessary: assets/ -> /assets/
bodyContent = bodyContent.replace(/"assets\//g, '"/assets/');

const vueComponent = [
  '<template>',
  '  <div class="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-pretendard landing-wrapper">',
  bodyContent,
  '  </div>',
  '</template>',
  '',
  '<script setup lang="ts">',
  '// 원장님이 작성해주신 HTML 원본을 그대로 적용했습니다.',
  '</script>',
  '',
  '<style scoped>',
  '@import url(\'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css\');',
  '.landing-wrapper { ',
  '  font-family: \'Pretendard\', -apple-system, BlinkMacSystemFont, system-ui, Roboto, \'Helvetica Neue\', \'Segoe UI\', \'Apple SD Gothic Neo\', \'Noto Sans KR\', \'Malgun Gothic\', sans-serif; ',
  '}',
  ':global(html) { scroll-behavior: smooth; }',
  '</style>'
].join('\n');

fs.writeFileSync('frontend/src/views/LandingView.vue', vueComponent);

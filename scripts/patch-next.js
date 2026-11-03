const fs = require('fs')
const path = require('path')

const target = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'lib', 'recursive-delete.js')
if (fs.existsSync(target)) {
  let content = fs.readFileSync(target, 'utf8')
  if (content.includes('const linkPath = await _fs.promises.readlink(absolutePath);') && !content.includes('let linkPath')) {
    content = content.replace(
      'const linkPath = await _fs.promises.readlink(absolutePath);',
      'let linkPath; try { linkPath = await _fs.promises.readlink(absolutePath); } catch {} if (!linkPath) return;'
    )
    fs.writeFileSync(target, content, 'utf8')
  }
}


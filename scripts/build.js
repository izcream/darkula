/**
 * Thanks Original dracula theme for some of function and idea 😊
 * Original Dracula License https://github.com/dracula/visual-studio-code/blob/master/LICENSE
 */
const degit = require('degit')
const { join } = require('path')
const { Type, DEFAULT_SCHEMA, load } = require('js-yaml')
const fs = require('fs')

const ORIGINAL_GITHUB_REPO = 'dracula/visual-studio-code/src/'
const ORIGINAL_THEME_PATH = join(__dirname, '../src/original/')
const BUILD_PATH = join(__dirname, '../darkula-color-theme.json')

const withAlphaType = new Type('!alpha', {
  kind: 'sequence',
  construct: ([hexRGB, alpha]) => hexRGB + alpha,
  represent: ([hexRGB, alpha]) => hexRGB + alpha
})

const schema = DEFAULT_SCHEMA.extend([withAlphaType])

/**
 * Download original dracula theme from github
 */
function downloadOriginalTheme() {
  return degit(ORIGINAL_GITHUB_REPO, {
    cache: false,
    force: true,
    verbose: true
  })
    .clone(ORIGINAL_THEME_PATH)
}

async function build() {
  await downloadOriginalTheme()
  const yaml = fs.readFileSync(`${ORIGINAL_THEME_PATH}/dracula.yml`, 'utf-8')
  const original = load(yaml, { schema })
  // Remove nulls and other falsey values from colors
  for (const key of Object.keys(original.colors)) {
    if (!original.colors[key]) {
      delete original.colors[key];
    }
  }
  const custom = load(fs.readFileSync('./src/darkula.yml', 'utf8'))
  //merged colors
  original.colors = Object.assign({}, original.colors, custom.colors)
  custom.colors = original.colors
  const merged = Object.assign(original, custom)
  fs.writeFileSync(BUILD_PATH, JSON.stringify(merged, null, 2))
  fs.rmSync(ORIGINAL_THEME_PATH, { recursive: true })
  console.log('theme builded 🚀')
}

build()

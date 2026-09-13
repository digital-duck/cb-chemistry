// Single source of truth for the
// output/{level}.{lang}/{model}/html/{kind}_{name}.html path schema.

function _base(domain, level, lang, model) {
  const modelPart = model ? `${model}/` : ''
  return `${import.meta.env.BASE_URL}domains/${domain}/output/${level}.${lang}/${modelPart}html/`
}

export function conceptUrl(domain, level, lang, model, nodeId) {
  return `${_base(domain, level, lang, model)}concept_${encodeURIComponent(nodeId)}.html`
}

export function bookUrl(domain, level, lang, model, target) {
  return `${_base(domain, level, lang, model)}book_${encodeURIComponent(target)}.html`
}

// Parses an output/{level}.{lang}/{model}/html/{kind}_{name}.html-shaped
// relative file path (as stored in catalog.json) into its parts.
export function parseLevelLangModel(file) {
  const llMatch = file.match(/output\/([^.]+)\.([^/]+)\//)
  const level = llMatch ? llMatch[1] : 'college'
  const lang = llMatch ? llMatch[2] : 'en'
  const modelMatch = file.match(/output\/[^/]+\/([^/]+)\/html\//)
  const model = modelMatch ? modelMatch[1] : ''
  return { level, lang, model }
}

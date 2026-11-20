const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const lunr = require('lunr');
const baseurl = (process.env.BASEURL || '').replace(/\/$/, '');
const collections = ['procedures', 'symptoms', 'causes', 'commands'];
const documents = [];
const effectiveStatus = (data, collection) => {
  if (collection !== 'procedures') return data.content_status || '';
  const governance = data.verification_governance_state || data.content_status || 'under_review';
  if (governance === 'verified') {
    return data.verification_v2_complete === true && data.verification_promotion_ready === true
      ? 'verified'
      : 'revalidation_required';
  }
  return governance;
};
for (const collection of collections) {
  const dir = `_${collection}`;
  for (const name of fs.readdirSync(dir).filter(entry => entry.endsWith('.md'))) {
    const parsed = matter(fs.readFileSync(path.join(dir, name), 'utf8'));
    const data = parsed.data;
    const slug = data.slug || path.basename(name, '.md');
    documents.push({
      id: `${collection}:${slug}`,
      title: data.title || slug,
      description: data.description || '',
      type: data.content_type || collection.replace(/s$/, ''),
      category: data.category || '',
      severity: data.severity || '',
      contentStatus: effectiveStatus(data, collection),
      legacyContentStatus: data.content_status || '',
      verificationGovernanceState: data.verification_governance_state || '',
      verificationV2Complete: data.verification_v2_complete === true,
      verificationPromotionReady: data.verification_promotion_ready === true,
      supportTier: data.support_tier || '',
      ownerTeam: data.owner_team || '',
      estimatedTime: data.estimated_time || '',
      reviewedBy: data.reviewed_by || '',
      tags: (data.tags || []).join(' '),
      errorCodes: (data.error_codes || []).join(' '),
      content: parsed.content.replace(/<[^>]+>/g, ' ').replace(/\{%[\s\S]*?%\}/g, ' ').replace(/\s+/g, ' ').trim(),
      url: `${baseurl}/${collection}/${slug}/`.replace(/\/{2,}/g, '/')
    });
  }
}
const index = lunr(function build() {
  this.ref('id');
  this.field('title', { boost: 14 });
  this.field('errorCodes', { boost: 14 });
  this.field('tags', { boost: 9 });
  this.field('category', { boost: 7 });
  this.field('description', { boost: 5 });
  this.field('supportTier', { boost: 3 });
  this.field('ownerTeam', { boost: 2 });
  this.field('contentStatus', { boost: 2 });
  this.field('content');
  documents.forEach(document => this.add(document));
});
fs.mkdirSync(path.join('assets', 'data'), { recursive: true });
fs.writeFileSync(path.join('assets', 'data', 'search-index.json'), JSON.stringify(index));
fs.writeFileSync(path.join('assets', 'data', 'search-documents.json'), JSON.stringify(documents, null, 2));
console.log(`Generated search data for ${documents.length} articles with risk, trust, tier and owner metadata`);

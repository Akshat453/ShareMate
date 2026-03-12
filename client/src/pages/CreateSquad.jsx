import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { SQUAD_CATEGORIES, FIELD_DEFINITIONS, BENEFIT_TYPES, CUSTOM_EXAMPLES } from '../utils/squadCategories';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import './CreateSquad.css';

const steps = ['Category', 'Basic Info', 'Details', 'Cost & People', 'Review'];

export default function CreateSquad() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [form, setForm] = useState({
    category: '', title: '', description: '', urgency: 'medium',
    locationAddress: '', minParticipants: 2, maxParticipants: 5,
    totalCost: '', costSplitMethod: 'equal',
    expiresAt: '', actionDeadline: '',
    meta: {}, tags: [],
    // Custom fields
    customCategoryLabel: '', customBenefitType: '', customBenefitNote: '',
    userDefinedTags: [],
  });

  const cat = SQUAD_CATEGORIES[form.category];
  const catFields = cat ? cat.fields.filter(f => FIELD_DEFINITIONS[f]) : [];

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setMeta = (key, val) => setForm(p => ({ ...p, meta: { ...p.meta, [key]: val } }));

  // Tag suggestions (debounced)
  useEffect(() => {
    if (form.category !== 'custom' || (!form.title && !form.description)) return;
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.post('/squad/suggest-tags', { title: form.title, description: form.description });
        setSuggestedTags(data.data.tags || []);
      } catch (e) { /* silent */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.title, form.description, form.category]);

  const addTag = (tag) => {
    if (form.userDefinedTags.length >= 5 || form.userDefinedTags.includes(tag)) return;
    set('userDefinedTags', [...form.userDefinedTags, tag]);
  };

  const removeTag = (tag) => set('userDefinedTags', form.userDefinedTags.filter(t => t !== tag));

  const useExample = (ex) => {
    setForm(p => ({
      ...p,
      title: ex.title,
      description: ex.description,
      customBenefitType: ex.benefitType,
      maxParticipants: ex.people,
      userDefinedTags: ex.tags || [],
      customCategoryLabel: ex.title,
    }));
  };

  const costPerPerson = form.totalCost && form.maxParticipants
    ? Math.ceil(Number(form.totalCost) / Number(form.maxParticipants)) : null;

  const canNext = () => {
    if (step === 0) return !!form.category;
    if (step === 1) return form.title.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        urgency: form.urgency,
        location: { address: form.locationAddress, coordinates: [77.209, 28.614] },
        minParticipants: Number(form.minParticipants),
        maxParticipants: Number(form.maxParticipants),
        totalCost: form.totalCost ? Number(form.totalCost) : undefined,
        costSplitMethod: form.costSplitMethod,
        costPerPerson: costPerPerson || undefined,
        expiresAt: form.expiresAt || undefined,
        actionDeadline: form.actionDeadline || undefined,
        meta: form.meta,
        tags: form.tags,
      };
      if (form.category === 'custom') {
        payload.customCategoryLabel = form.customCategoryLabel;
        payload.customBenefitType = form.customBenefitType;
        payload.customBenefitNote = form.customBenefitNote;
        payload.userDefinedTags = form.userDefinedTags;
      }
      const { data } = await api.post('/squad', payload);
      navigate(`/squad/${data.data.post._id}`);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-content">
      <div className="create-squad">
        {/* Progress */}
        <div className="create-squad__progress">
          {steps.map((s, i) => (
            <div key={s} className={`create-squad__step ${i <= step ? 'create-squad__step--active' : ''} ${i < step ? 'create-squad__step--done' : ''}`}>
              <span className="create-squad__step-num">{i < step ? '✓' : i + 1}</span>
              <span className="create-squad__step-label">{s}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="create-squad__panel"
          >
            {/* STEP 0 — Category Picker */}
            {step === 0 && (
              <div>
                <h2 className="create-squad__heading">What do you want to do together?</h2>
                <p className="create-squad__sub">Choose a category for your squad post.</p>
                <div className="create-squad__cat-grid">
                  {Object.values(SQUAD_CATEGORIES).map((c) => (
                    <button
                      key={c.key}
                      className={`create-squad__cat-tile ${form.category === c.key ? 'create-squad__cat-tile--selected' : ''} ${c.key === 'custom' ? 'create-squad__cat-tile--custom' : ''}`}
                      style={form.category === c.key ? { borderColor: c.color, boxShadow: `0 0 20px ${c.color}20` } : {}}
                      onClick={() => set('category', c.key)}
                    >
                      <span className="create-squad__cat-icon">{c.icon}</span>
                      <span className="create-squad__cat-label">{c.label}</span>
                      {c.key === 'custom' && <span className="create-squad__cat-sub">Don't see your idea? Post it anyway.</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 1 — Basic Info */}
            {step === 1 && (
              <div>
                <h2 className="create-squad__heading">Tell us about it</h2>
                {/* Inspire Me for custom */}
                {form.category === 'custom' && (
                  <div className="create-squad__inspire">
                    <h4 className="create-squad__inspire-title">💡 Here's what others have posted:</h4>
                    <div className="create-squad__inspire-scroll">
                      {CUSTOM_EXAMPLES.map((ex, i) => (
                        <button key={i} className="create-squad__inspire-card" onClick={() => useExample(ex)}>
                          <p className="create-squad__inspire-name">{ex.title}</p>
                          <span className="create-squad__inspire-people">{ex.people} people</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="create-squad__fields">
                  <Input label="Title" value={form.title} onChange={e => set('title', e.target.value)} />
                  <div className="create-squad__textarea-wrap">
                    <label className="create-squad__label">Description</label>
                    <textarea
                      className="create-squad__textarea"
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      rows={4}
                      placeholder="Describe what you need people for..."
                      maxLength={2000}
                    />
                  </div>
                  <Input label="Location / Area" value={form.locationAddress} onChange={e => set('locationAddress', e.target.value)} />
                  <div className="create-squad__row">
                    <div className="create-squad__select-wrap">
                      <label className="create-squad__label">Urgency</label>
                      <select className="create-squad__select" value={form.urgency} onChange={e => set('urgency', e.target.value)}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — Category-specific Fields / Custom Freeform */}
            {step === 2 && (
              <div>
                <h2 className="create-squad__heading">
                  {form.category === 'custom' ? 'Describe your idea' : `${cat?.icon} ${cat?.label} Details`}
                </h2>
                <div className="create-squad__fields">
                  {form.category === 'custom' ? (
                    <>
                      <Input label="What do you call this?" value={form.customCategoryLabel} onChange={e => set('customCategoryLabel', e.target.value)} />
                      <div className="create-squad__select-wrap">
                        <label className="create-squad__label">Benefit of doing this together</label>
                        <select className="create-squad__select" value={form.customBenefitType} onChange={e => set('customBenefitType', e.target.value)}>
                          <option value="">Select...</option>
                          {BENEFIT_TYPES.map(b => <option key={b.value} value={b.value}>{b.icon} {b.label}</option>)}
                        </select>
                      </div>
                      {form.customBenefitType === 'other' && (
                        <Input label="Tell us in your own words" value={form.customBenefitNote} onChange={e => set('customBenefitNote', e.target.value)} />
                      )}
                      {/* Tags */}
                      <div>
                        <label className="create-squad__label">Tags (max 5)</label>
                        <div className="create-squad__tags">
                          {form.userDefinedTags.map(t => (
                            <Badge key={t} variant="gold" size="sm" onClick={() => removeTag(t)}>
                              {t} ×
                            </Badge>
                          ))}
                        </div>
                        <input
                          className="create-squad__tag-input"
                          placeholder="Type a tag and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const v = e.target.value.trim();
                              if (v) { addTag(v); e.target.value = ''; }
                            }
                          }}
                        />
                        {suggestedTags.length > 0 && (
                          <div className="create-squad__suggested">
                            <span className="create-squad__suggested-label">Suggested:</span>
                            {suggestedTags.map(t => (
                              <button key={t} className="create-squad__suggested-tag" onClick={() => addTag(t)}>{t}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    catFields.map(field => {
                      const def = FIELD_DEFINITIONS[field];
                      if (!def) return null;
                      if (def.type === 'select') {
                        return (
                          <div key={field} className="create-squad__select-wrap">
                            <label className="create-squad__label">{def.label}</label>
                            <select className="create-squad__select" value={form.meta[field] || ''} onChange={e => setMeta(field, e.target.value)}>
                              <option value="">Select...</option>
                              {def.options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        );
                      }
                      if (def.type === 'textarea') {
                        return (
                          <div key={field} className="create-squad__textarea-wrap">
                            <label className="create-squad__label">{def.label}</label>
                            <textarea className="create-squad__textarea" rows={3} placeholder={def.placeholder || ''} value={form.meta[field] || ''} onChange={e => setMeta(field, e.target.value)} />
                          </div>
                        );
                      }
                      return (
                        <Input key={field} label={def.label} type={def.type || 'text'} placeholder={def.placeholder || ''} value={form.meta[field] || ''} onChange={e => setMeta(field, e.target.value)} />
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* STEP 3 — Cost & People */}
            {step === 3 && (
              <div>
                <h2 className="create-squad__heading">Cost & Participants</h2>
                <div className="create-squad__fields">
                  <div className="create-squad__row">
                    <Input label="Min Participants" type="number" value={form.minParticipants} onChange={e => set('minParticipants', e.target.value)} />
                    <Input label="Max Participants" type="number" value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)} />
                  </div>
                  <Input label="Total Cost (₹) — leave empty if free" type="number" value={form.totalCost} onChange={e => set('totalCost', e.target.value)} />
                  {costPerPerson && (
                    <div className="create-squad__cost-preview">
                      <span className="create-squad__cost-amount">₹{costPerPerson}</span>
                      <span className="create-squad__cost-label">per person (estimated)</span>
                    </div>
                  )}
                  <div className="create-squad__select-wrap">
                    <label className="create-squad__label">Cost Split Method</label>
                    <select className="create-squad__select" value={form.costSplitMethod} onChange={e => set('costSplitMethod', e.target.value)}>
                      <option value="equal">Equal Split</option>
                      <option value="custom">Custom</option>
                      <option value="free">Free</option>
                      <option value="organizer_decides">Organizer Decides</option>
                    </select>
                  </div>
                  <Input label="Deadline / Expiry" type="datetime-local" value={form.actionDeadline} onChange={e => set('actionDeadline', e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 4 — Review */}
            {step === 4 && (
              <div>
                <h2 className="create-squad__heading">Review & Post</h2>
                <div className="create-squad__review">
                  <div className="create-squad__review-row">
                    <span className="create-squad__review-label">Category</span>
                    <span>{cat?.icon} {form.category === 'custom' ? form.customCategoryLabel || 'Custom' : cat?.label}</span>
                  </div>
                  <div className="create-squad__review-row">
                    <span className="create-squad__review-label">Title</span>
                    <span>{form.title}</span>
                  </div>
                  {form.description && (
                    <div className="create-squad__review-row">
                      <span className="create-squad__review-label">Description</span>
                      <span style={{ maxWidth: 400 }}>{form.description.substring(0, 120)}{form.description.length > 120 ? '...' : ''}</span>
                    </div>
                  )}
                  <div className="create-squad__review-row">
                    <span className="create-squad__review-label">Participants</span>
                    <span>{form.minParticipants} – {form.maxParticipants}</span>
                  </div>
                  {costPerPerson && (
                    <div className="create-squad__review-row">
                      <span className="create-squad__review-label">Cost</span>
                      <span className="text-gold" style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>₹{costPerPerson}/person</span>
                    </div>
                  )}
                  <div className="create-squad__review-row">
                    <span className="create-squad__review-label">Location</span>
                    <span>{form.locationAddress || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="create-squad__nav">
          {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
          <div style={{ flex: 1 }} />
          {step < 4 ? (
            <Button variant="primary" disabled={!canNext()} onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <Button variant="primary" size="lg" loading={loading} onClick={handleSubmit}>
              🚀 Post Squad
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

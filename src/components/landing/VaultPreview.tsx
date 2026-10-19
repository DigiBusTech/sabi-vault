import { ArrowUpRight, Check, FileBadge2, Fingerprint, LockKeyhole } from "lucide-react";

const previewRecords = [
  { icon: FileBadge2, category: "Education", title: "BSc Computer Engineering", issuer: "University of Lagos" },
  { icon: Fingerprint, category: "Employment", title: "Systems Engineer", issuer: "Work history" },
];

export function VaultPreview() {
  return (
    <div className="preview-scene" aria-label="Sample Sabi Vault product preview">
      <div className="preview-orbit preview-orbit-one" />
      <div className="preview-orbit preview-orbit-two" />
      <section className="preview-card">
        <div className="preview-card-heading">
          <div>
            <span className="preview-overline">SAMPLE VAULT</span>
            <h2>Credentials, in one place</h2>
          </div>
          <span className="preview-avatar" aria-hidden="true">A</span>
        </div>

        <div className="preview-profile">
          <div className="preview-profile-icon"><LockKeyhole size={17} /></div>
          <div>
            <strong>A sample profile</strong>
            <span>Only you control what gets shared</span>
          </div>
          <span className="preview-private"><span /> Private</span>
        </div>

        <div className="preview-record-list">
          {previewRecords.map(({ icon: Icon, category, title, issuer }) => (
            <article className="preview-record" key={category}>
              <div className="preview-record-icon"><Icon size={18} /></div>
              <div className="preview-record-copy">
                <span>{category}</span>
                <strong>{title}</strong>
                <small>{issuer}</small>
              </div>
              <span className="preview-record-check" aria-label="Record stored"><Check size={14} /></span>
            </article>
          ))}
        </div>

        <div className="preview-card-footer">
          <span><LockKeyhole size={13} /> Sharing is permission-based</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </div>
      </section>

      <div className="preview-floating-note">
        <span className="preview-note-icon"><Check size={16} /></span>
        <span><strong>Scoped sharing</strong><small>Choose what an organisation can see</small></span>
      </div>
    </div>
  );
}

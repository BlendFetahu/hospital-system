export default function Landing() {
  return (
    <main>
      {/* Hero */}
      <section style={{padding:"56px 16px"}}>
        <div style={{maxWidth:1100, margin:"0 auto"}}>
          <h1 style={{fontSize:38, margin:"0 0 12px"}}>Menaxhim modern i spitalit</h1>
          <p style={{maxWidth:640, margin:"0 0 20px", lineHeight:1.6}}>
            Panele të ndara për <b>Admin</b>, <b>Doktor</b> dhe <b>Pacient</b>.
            Planifikim takimesh, kartela mjekësore dhe raporte.
          </p>
          <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
            <a href="#register" style={{padding:"10px 14px", borderRadius:8, background:"#000", color:"#fff"}}>
              Get Started
            </a>
            <a href="#features" style={{padding:"10px 14px", borderRadius:8, border:"1px solid #ddd"}}>
              Shiko veçoritë
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{padding:"24px 16px 40px", background:"#fafafa", borderTop:"1px solid #eee", borderBottom:"1px solid #eee"}}>
        <div style={{maxWidth:1100, margin:"0 auto", display:"grid",
                     gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:16}}>
          <FeatureCard title="Admin" desc="Menaxhon përdoruesit, departamentet, raportet." />
          <FeatureCard title="Doktor" desc="Shikon/plotëson kartela, menaxhon oraret dhe vizitat." />
          <FeatureCard title="Pacient" desc="Rezervon takime, sheh historikun dhe rezultatet." />
        </div>
      </section>

      {/* Contact (placeholder) */}
      <section id="contact" style={{padding:"32px 16px"}}>
        <div style={{maxWidth:1100, margin:"0 auto"}}>
          <h2 style={{fontSize:22, margin:"0 0 12px"}}>Na kontakto</h2>
          <p style={{margin:0}}>support@hospital-system.local</p>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div style={{background:"#fff", border:"1px solid #eee", borderRadius:10, padding:16}}>
      <h3 style={{margin:"0 0 8px", fontSize:18}}>{title}</h3>
      <p style={{margin:0, color:"#444", lineHeight:1.6}}>{desc}</p>
    </div>
  );
}

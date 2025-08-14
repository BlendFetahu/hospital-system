export default function Footer() {
  return (
    <footer style={{borderTop:"1px solid #eee"}}>
      <div style={{maxWidth:1100, margin:"0 auto", padding:"16px", fontSize:12, color:"#666"}}>
        © {new Date().getFullYear()} Hospital System
      </div>
    </footer>
  );
}

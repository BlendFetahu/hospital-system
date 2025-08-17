import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header style={{borderBottom:"1px solid #eee"}}>
      <div style={{
        maxWidth:1100, margin:"0 auto", padding:"12px 16px",
        display:"flex", alignItems:"center", justifyContent:"space-between"
      }}>
        <strong style={{fontSize:20}}>Hospital System</strong>
        <nav style={{display:"flex", gap:16, fontSize:14}}>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
          <Link to="/login"  style={{padding:"6px 10px", border:"1px solid #ddd", borderRadius:6}}>Login</Link>
          <Link to="/signup" style={{padding:"6px 10px", border:"1px solid #ddd", borderRadius:6}}>Signup</Link>
        </nav>
      </div>
    </header>
  );
}


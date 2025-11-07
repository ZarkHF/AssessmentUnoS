import { Link, useLocation } from "react-router";
const unosquarelogo = URL("../../../assets/unosquare.webp", import.meta.url);
export function NavigationComponent() {
    const location = useLocation();

    function isLinkActive(path) {
        return location.pathname === path;
    }

    return (
        <nav className="navbar navbar-expand-md bg-body-tertiary">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    <img src={unosquarelogo} alt="Logo" width="150" height="50" />
                    Technical Assessment
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navBarMain" aria-controls="navBarMain" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navBarMain">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isLinkActive("/") ? "active" : ""}`}
                                aria-current="page"
                                to="/"
                            >
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isLinkActive("/about") ? "active" : ""}`}
                                to="/about"
                            >
                                About
                            </Link>
                        </li>                       
                            
                        <li className="nav-item">
                            <a href="https://dev.azure.com/UnoquareCSharpCoE" rel="noreferrer" target="_blank" className="nav-link">🌐 Azure DevOps</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}
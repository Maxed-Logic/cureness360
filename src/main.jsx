import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/Css/animate.css'
import './assets/Css/laboix.css'

import './assets/Css/mainmenu.css'
import './assets/Css/responsive.css'
import './Pages/Dahboard/InvestmentForm/AgreementForm.css'; 
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
)
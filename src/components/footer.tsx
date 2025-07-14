import { useTranslation } from "react-i18next";

export default function Footer() {
    const { t } = useTranslation();
    return(
      <footer className="text-center py-6 text-gray-400 text-sm">
      <p>© 2025 Yapson. Tous droits réservés.<a className="text-blue-500 font-extrabold" href="https://api.yapson.net/yapson/privacy/policy/"> Politique de confidentialité</a></p>
    </footer>
    )
}
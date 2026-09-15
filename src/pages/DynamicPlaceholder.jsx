import { useParams } from "react-router-dom";
import PagePlaceholder from "./PagePlaceholder";
import BackButton from "../components/BackButton";

const META = {
  fiszki:    { icon: "🗂️", parent: "/fiszki",    parentLabel: "Fiszki"    },
  gramatyka: { icon: "📚", parent: "/gramatyka", parentLabel: "Gramatyka" },
};

function slugNaTytul(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function DynamicPlaceholder({ kind }) {
  const params = useParams();
  const slug = params.deck || params.tense || "";
  const meta = META[kind];

  return (
    <div>
      <div className="pt-6 flex justify-center">
        <BackButton to={meta.parent} label={meta.parentLabel} />
      </div>
      <PagePlaceholder
        icon={meta.icon}
        title={slugNaTytul(slug)}
        desc="Ta sekcja jest jeszcze w budowie."
      />
    </div>
  );
}

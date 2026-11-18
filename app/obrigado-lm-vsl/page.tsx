import type { Metadata } from "next";
import Image from "next/image";
import ObrigadoLmvsl from "@/components/lead-magnetic-vsl/obrigado";
import { contentLeadMagneticVsl as c } from "@/lib/content-lead-magnetic-vsl";
import "../lead-magnetic-vsl/lmvsl.css";

export const metadata: Metadata = {
  title: c.obrigado.meta.title,
  description: c.obrigado.meta.description,
  robots: { index: false, follow: false },
};

export default function ObrigadoLmVslPage() {
  return (
    <div className="lmvsl lmvsl-obrigado">
      <main>
        <div>
          <Image className="lv-obrigado-logo" src="/images/logo-alpha.png" alt="Assessoria Alpha" width={764} height={247} priority sizes="200px" />
          <ObrigadoLmvsl />
        </div>
      </main>
    </div>
  );
}

/* Referências consultadas em 22/10/2026. Reconstruções originais, não arquivos CAD OEM. */
'use strict';
const HardwareCatalog={
 board:{source:'https://www.msi.com/Motherboard/MAG-B550-TOMAHAWK',dimensions:'ATX • 305 × 244 mm',note:'Reconstrução visual da B550 Tomahawk. Posições de alguns conectores e detalhes do PCB ainda são aproximadas.'},
 cpu:{source:'https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5600.html',dimensions:'AM4 • substrato de 40 × 40 mm',note:'IHS metálico, gravação e pinos inferiores modelados. A matriz de pinos está simplificada.'},
 cooler:{source:'https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5600.html',dimensions:'Wraith Stealth • refrigeração radial',note:'Reconstrução da arquitetura radial do cooler. Aletas, pás e montagem têm medidas aproximadas.'},
 ram:{source:'https://www.kingston.com/datasheets/KF432C16BBK2_16.pdf',dimensions:'133,35 × 34 × 7,2 mm por módulo',note:'Formato baseado no KF432C16BBK2/16. Relevo do dissipador e impressão são reconstruções aproximadas.'},
 ssd:{source:'https://documents.westerndigital.com/content/dam/doc-library/en_us/assets/public/western-digital/product/internal-drives/wd-black-ssd/product-brief-wd-black-sn770-nvme-ssd.pdf',dimensions:'M.2 2280 • 80 × 22 mm',note:'PCB, contatos e identificação do SN770 1 TB reconstruídos. A etiqueta não representa um número de série real.'},
 psu:{source:'https://www.corsair.com/us/en/p/psu/cp-9020122-na/cx-series-cx650-650-watt-80-plus-bronze-certified-atx-psu-cp-9020122-na',dimensions:'CX650 CP-9020122 • 150 × 86 × 140 mm',note:'Referência da revisão CP-9020122. A carcaça permanece fechada; os detalhes da grade são aproximados.'},
 gpu:{source:'https://www.asus.com/ie/motherboards-components/graphics-cards/dual/dual-rtx4060-o8g/techspec/',dimensions:'DUAL-RTX4060-O8G • 227,2 × 123,24 × 49,6 mm',note:'Reconstrução da ASUS Dual: duas ventoinhas, backplate e conexão PCIe vertical. Carenagem e detalhes internos ainda têm aproximações.'}
};

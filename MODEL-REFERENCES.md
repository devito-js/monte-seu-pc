# Referências dos componentes

As reconstruções em `hardware-models.js` foram criadas neste projeto a partir das referências abaixo, consultadas em 22/10/2026. São modelos originais baseados em produtos identificados; não são arquivos CAD fornecidos pelos fabricantes nem réplicas certificadas. A escolha é uma amostra de componentes conhecidos, sem alegação de ranking de vendas.

| Componente | Referência oficial | Aplicação no modelo |
| --- | --- | --- |
| ASUS Dual RTX 4060 OC, DUAL-RTX4060-O8G | [Especificações ASUS](https://www.asus.com/ie/motherboards-components/graphics-cards/dual/dual-rtx4060-o8g/techspec/) e [imagem frontal ASUS](https://dlcdnwebimgs.asus.com/gain/1f8129e1-1bd3-4518-941e-5ea01dd7ab20/w800) | Envelope de referência 227,2 × 123,24 × 49,6 mm; dois rotores com pás curvas e anéis externos, carenagem com recortes, painéis angulares, backplate, dissipador, bracket e conector de 8 pinos. Posição vertical na placa-mãe. |
| MSI MAG B550 TOMAHAWK | [Produto MSI](https://www.msi.com/Motherboard/MAG-B550-TOMAHAWK) e [datasheet MSI](https://storage-asset.msi.com/datasheet/mb/global/MAG-B550-TOMAHAWK.pdf) | PCB ATX, arquitetura do soquete AM4, quatro slots DDR4, dissipadores VRM, M.2 e chipset, alimentação e painel traseiro. Layout de componentes menores e alguns conectores aproximados. |
| AMD Ryzen 5 5600 e Wraith Stealth | [AMD](https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5600.html) | Substrato, IHS chanfrado, identificação e pinos inferiores. Cooler radial com aletas, ventoinha e quatro pontos de fixação. A matriz de pinos é visualmente simplificada e as medidas do cooler são estimadas. |
| Kingston FURY Beast KF432C16BBK2/16 | [Datasheet Kingston](https://www.kingston.com/datasheets/KF432C16BBK2_16.pdf) | Referência de 133,35 × 34 × 7,2 mm por módulo, dissipadores pretos assimétricos, contatos separados e identificação. O relevo e a impressão são aproximações. |
| WD_BLACK SN770 1 TB | [Product brief WD](https://documents.westerndigital.com/content/dam/doc-library/en_us/assets/public/western-digital/product/internal-drives/wd-black-ssd/product-brief-wd-black-sn770-nvme-ssd.pdf) | PCB 80 × 22 mm, encapsulamentos, borda de conexão e etiqueta reconstruída sem número de série de uma unidade real. |
| Corsair CX650 CP-9020122 | [Corsair](https://www.corsair.com/us/en/p/psu/cp-9020122-na/cx-series-cx650-650-watt-80-plus-bronze-certified-atx-psu-cp-9020122-na) | Carcaça fechada com envelope de referência 150 × 86 × 140 mm, grade, ventoinha, entrada de energia e identificação lateral. Não representa a revisão compacta CP-9020278. |

Medidas de referência descrevem os produtos. A modelagem foi ajustada ao protótipo e não garante tolerâncias mecânicas de fabricação. Formatos de cabeamento, encaixes e fixação continuam assistidos e simplificados. O gabinete é uma bancada de serviço genérica ampliada para acomodar a fonte.

Circuitos, etiquetas, painéis gráficos e textura de metal escovado são desenhados por código. A imagem oficial em `qa/asus-reference.png` é uma referência visual de inspeção e não é carregada pelo jogo.

A iluminação usa um ambiente de estúdio gerado localmente e pré-filtrado para reflexos PBR. Os modelos usam instâncias nos detalhes repetidos, como pinos e contatos, para reduzir chamadas de desenho. Nenhum arquivo adicional é baixado durante o jogo.

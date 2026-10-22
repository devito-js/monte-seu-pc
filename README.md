# Bancada — montagem manual de computadores

Abra `index.html` em Chrome, Edge ou Firefox com aceleração gráfica ativa. A biblioteca Three.js 0.158.0 e sua licença MIT estão em `vendor/`: o jogo funciona sem servidor e sem internet.

## Biblioteca e manipulação

- Busque por nome ou especificação, ou filtre por categoria. A busca aceita palavras sem acento.
- Clique em uma peça para colocá-la na mão virtual, ou arraste o cartão até o gabinete.
- A peça acompanha o mouse sobre a bancada. Seu pivô fica suspenso; o pequeno círculo abaixo indica a posição projetada de instalação.
- Use Q/E ou os botões na mão para girar em passos de 90°. Não há rotação automática.
- O contorno mostra a posição final: azul para alinhamento, âmbar quando falta uma etapa e verde quando é possível encaixar.
- Clique ou pressione Enter para encaixar. Posição, orientação e pré-requisitos são verificados antes da instalação. O botão lateral só permite encaixar quando essas verificações passam.
- WASD ou as setas movem a peça em passos de 10 mm; Shift reduz para 2 mm. É possível montar sem precisão do mouse.
- Esc ou Devolver retorna a peça à biblioteca sem alterar as instaladas.

A mão virtual representa a peça presa ao cursor: não há avatar nem mão humana 3D animada.

## Câmera, inspeção e desmontagem

Arraste com o botão direito para orbitar enquanto segura uma peça. Com a mão vazia, o botão esquerdo também orbita; clicar em uma peça instalada abre sua inspeção. A roda controla o zoom e R ou Restaurar câmera volta à vista inicial.

Vista explodida separa os componentes instalados para inspeção. Devolva primeiro a peça que está na mão. Pegar uma nova peça volta à montagem normal.

Selecione uma peça instalada e use Remover para a biblioteca. O jogo exige que seus dependentes sejam removidos primeiro. Remover uma peça desliga a simulação. Ligar computador faz o POST simplificado e ativa as ventoinhas quando todas as etapas foram concluídas.

O progresso é salvo localmente quando o navegador permite. Montagens da versão anterior continuam compatíveis. Reiniciar bancada limpa a montagem após confirmação.

## Escopo atual

Há um conjunto compatível AM4 com dez etapas. Os modelos procedurais têm dimensões aproximadas, materiais PBR, sombras e animação de encaixe. Não são réplicas exatas de produtos de fabricantes.

O posicionamento manual acontece sobre um plano horizontal de montagem, com encaixe assistido quando o usuário alinha a peça. Não há gravidade nem colisões físicas. Memórias, espaçadores e cabos ainda são conjuntos; pasta térmica, travas e parafusos não têm manipulação individual. Não há catálogo de modelos alternativos, simulação elétrica ou térmica, BIOS real, sistema operacional, notebooks ou VR nesta versão.

## Validação

Verificação sintática: `node --check placement.js`, `node --check hardware3d.js`, `node --check game.js`.

O script `node qa-3d.cjs` conecta a uma instância de teste do Chrome com depuração na porta 9334 e esta página aberta. Use um perfil dedicado: o script limpa a montagem desse perfil e fecha o navegador ao terminar. Ele verifica arrastar nativo da biblioteca, encaixe por mouse, distância, rotação incorreta, pré-requisitos, devolução, montagem completa, POST, desmontagem, busca, categorias, persistência e largura móvel. As capturas ficam em `qa/in-hand.png` e `qa/manual-assembled.png`.

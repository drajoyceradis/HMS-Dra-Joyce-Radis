# Acelerador PS de Clínica Médica (HMS) #

Página principal: **gerador.html**

## Funcionalidades e Conformidade ONA 3
Este sistema foi reescrito para respeitar as exigências técnicas da certificação ONA 3 para o preenchimento de prontuários:
- **Separação rigorosa de Queixa (Sintomas)** e **Hipótese Diagnóstica (Patologias)**;
- **Sem caracteres de internet:** Eliminação absoluta de travessões (`-`), emojis e outros caracteres informais. Os tópicos e listas são delineados por quebra de linhas para leitura clínica fluída e fácil colagem no prontuário eletrônico;
- **Auto-Save anti-falhas:** Todo o preenchimento é salvo automaticamente no cache. Se o sistema hospitalar cair e a página atualizar, nenhum dado é perdido.
- **Digitação por Voz:** Acelera o fluxo do plantão permitindo falar ao invés de digitar.
- **Parser de Exames Inteligente:** Resume laudos brutos formatando-os para leitura clínica concisa, usando marcadores como o pipe (`|`) ao invés de hifens.

## Hospedagem e Acesso
Link: https://drajoyceradis.github.io/HMS-Dra-Joyce-Radis/gerador.html

Arquivos de estrutura:
- `gerador.html`: Interface visual ONA 3 e inteligência integradas (uso principal).
- `app.js`: Backend unificado (caso seja utilizado em outras páginas customizadas).
- `.nojekyll`, `index.html` e `home.html`: Suporte nativo para GitHub Pages.

# modopag-blog — notas de manutenção

## Cópias de trabalho (worktrees) — onde nascem e quando somem

Regra do Vitor (25/11/2026), depois de a raiz `~/Developer/modopag` acumular 66 worktrees soltas:

- **Toda worktree nova nasce em `~/Developer/modopag/.worktrees/<nome>`**, nunca solta na raiz nem dentro do repositório. Use caminho **absoluto** — `git -C <repo> worktree add <caminho-relativo>` resolve o caminho a partir do repo e cria a cópia dentro dele:
  ```bash
  git -C ~/Developer/modopag/<repo> fetch -q
  git -C ~/Developer/modopag/<repo> worktree add ~/Developer/modopag/.worktrees/<nome> -b <branch> origin/main
  ```
- **Depois do merge e do deploy conferido, a própria sessão remove a worktree dela:** `git -C ~/Developer/modopag/<repo> worktree remove ~/Developer/modopag/.worktrees/<nome>` (falha se houver alteração não salva — aí pare e avise; não force). Não remova worktree que outra sessão ou rotina esteja usando.
- A raiz guarda só os repositórios principais e as pastas `campanhas/`, `relatorios/`, `materiais/`, `arquivo/`. Material com dado pessoal (listas de destinatários, exportações) não fica no disco depois do uso.


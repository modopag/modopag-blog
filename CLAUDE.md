# modopag-blog — notas de manutenção

## Cópias de trabalho (worktrees) — quando usar, onde nascem e quando somem

Regra do Vitor (25/11/2026). A raiz `~/Developer/modopag` só guarda os repositórios principais e as pastas de tema (`campanhas/`, `relatorios/`, `materiais/`, `arquivo/`). A bagunça de antes veio de worktrees soltas na raiz e nunca removidas (66 em 25/11).

1. **Primeiro passo de toda sessão de trabalho:** rodar a varredura
   ```bash
   ~/Developer/modopag/checkout-modopag-v1/scripts/limpar-worktrees.sh            # SO_LISTAR=1 para só ver
   ```
   Ela percorre todos os repositórios em `~/Developer/modopag`, remove as worktrees **mescladas na main** (branch contido em `origin/main` ou PR mesclado no GitHub) **sem nenhuma alteração** e **sem processo usando a pasta**, apaga o branch local delas, roda `git worktree prune` e mostra o que ficou e por quê. Nunca força.
2. **Quando usar worktree:** só quando houver **2 ou mais agentes no mesmo repositório ao mesmo tempo**. Agente sozinho trabalha no repositório principal, num branch próprio, e **volta para a `main` no fim**.
3. **Onde:** `~/Developer/modopag/.worktrees/<repo>-<tarefa>`, nunca na raiz nem dentro do repositório. Caminho **absoluto** (`git -C <repo> worktree add <relativo>` resolve a partir do repo e cria a cópia dentro dele):
   ```bash
   git -C ~/Developer/modopag/<repo> fetch -q
   git -C ~/Developer/modopag/<repo> worktree add ~/Developer/modopag/.worktrees/<repo>-<tarefa> -b <branch> origin/main
   ```
4. **Remoção:** ao terminar (merge feito **e** deploy conferido no que está publicado), a sessão roda `git worktree remove <caminho>` e apaga o branch local (`git branch -D <branch>`). Se `worktree remove` recusar por alteração não salva, pare e avise — não force. **Tarefa não concluída:** a worktree fica e é listada no relatório final da sessão.

Material com dado pessoal (listas de destinatários, exportações) não fica no disco depois do uso.


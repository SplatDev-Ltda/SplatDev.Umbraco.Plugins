angular.module("umbraco").controller("LgpdDashboardController", [
    "$scope", "$http",
    function ($scope, $http) {
        // Umbraco 13 counterpart of the Lit dashboard. Same endpoints, same rules —
        // notably that a refusal needs a justificativa before the API will accept it.
        var api = "/umbraco/api/lgpd";

        $scope.rotuloDireito = {
            confirmacao: "Confirmação de tratamento (art. 18, I)",
            acesso: "Acesso aos dados (II)",
            correcao: "Correção (III)",
            anonimizacao_bloqueio_eliminacao: "Anonimização, bloqueio ou eliminação (IV)",
            portabilidade: "Portabilidade (V)",
            eliminacao_consentimento: "Eliminação de dados consentidos (VI)",
            informacao_compartilhamento: "Informação sobre compartilhamento (VII)",
            informacao_nao_consentir: "Informação sobre não consentir (VIII)",
            revogacao: "Revogação do consentimento (IX)"
        };

        $scope.rotuloBase = {
            consentimento: "Consentimento (art. 7, I)",
            obrigacao_legal: "Obrigação legal (II)",
            politicas_publicas: "Políticas públicas (III)",
            estudo_pesquisa: "Estudo por órgão de pesquisa (IV)",
            execucao_contrato: "Execução de contrato (V)",
            exercicio_direitos: "Exercício de direitos em processo (VI)",
            protecao_vida: "Proteção da vida (VII)",
            tutela_saude: "Tutela da saúde (VIII)",
            legitimo_interesse: "Legítimo interesse (IX)",
            protecao_credito: "Proteção do crédito (X)"
        };

        $scope.painel = null;
        $scope.vocab = null;
        $scope.requisicoes = [];
        $scope.operacoes = [];
        $scope.filtro = "pendente";
        $scope.opDraft = null;
        $scope.loading = true;
        $scope.busy = false;
        $scope.msg = null;

        $scope.load = function () {
            $scope.loading = true;
            $http.get(api + "/Painel").then(function (r) { $scope.painel = r.data; });
            $http.get(api + "/Vocabulario").then(function (r) { $scope.vocab = r.data; });
            $http.get(api + "/Operacoes").then(function (r) { $scope.operacoes = r.data; });
            $http.get(api + "/Requisicoes?status=" + encodeURIComponent($scope.filtro))
                .then(function (r) { $scope.requisicoes = r.data; })
                .finally(function () { $scope.loading = false; });
        };

        $scope.setFiltro = function (f) { $scope.filtro = f; $scope.load(); };

        $scope.diasRestantes = function (prazo) {
            return Math.ceil((Date.parse(prazo) - Date.now()) / 86400000);
        };

        $scope.aberta = function (r) {
            return r.status === "pendente" || r.status === "em_andamento";
        };

        function post(path, body, method) {
            $scope.busy = true; $scope.msg = null;
            var req = (method === "DELETE")
                ? $http.delete(api + "/" + path)
                : $http.post(api + "/" + path, body);
            return req.then(function (r) {
                $scope.msg = { ok: true, texto: (r.data && r.data.mensagem) || "Feito." };
                $scope.load();
                return true;
            }, function (r) {
                $scope.msg = { ok: false, texto: (r.data && r.data.mensagem) || "Falhou." };
                return false;
            }).finally(function () { $scope.busy = false; });
        }

        $scope.concluir = function (r) {
            post("AtualizarRequisicao", { id: r.id, status: "concluida", justificativa: null });
        };

        $scope.recusar = function (r) {
            // Art. 18 §4 requires a reasoned refusal; the API rejects a blank one.
            var j = prompt("Justificativa da recusa (art. 18, §4º):");
            if (!j || !j.trim()) return;
            post("AtualizarRequisicao", { id: r.id, status: "recusada", justificativa: j.trim() });
        };

        $scope.novaOperacao = function () {
            $scope.opDraft = {
                id: 0, nome: "", finalidade: "", baseLegal: "consentimento",
                categoriasDados: "", contemDadoSensivel: false,
                compartilhamento: "", retencao: "", ativa: true
            };
        };

        $scope.editarOperacao = function (o) { $scope.opDraft = angular.copy(o); };

        $scope.salvarOperacao = function () {
            post("SalvarOperacao", $scope.opDraft).then(function (ok) {
                if (ok) $scope.opDraft = null;
            });
        };

        $scope.removerOperacao = function (o) {
            if (!confirm('Remover "' + o.nome + '" do registro?')) return;
            post("RemoverOperacao?id=" + o.id, null, "DELETE");
        };

        $scope.load();
    }
]);

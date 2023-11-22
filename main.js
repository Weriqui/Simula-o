let pesquisa = document.querySelector("button")

async function obterToken(){
    // Verificar se já existe um token no localStorage
    const tokenSalvo = localStorage.getItem('token');
    if (tokenSalvo) {
        return tokenSalvo;
    }

    const response = await fetch('https://back-villela.aceleradorvillela.com/api/acesso', {
        method: 'POST',
        headers: {
          'authority': 'back-villela.aceleradorvillela.com',
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6',
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          'origin': 'https://portal-saas.aceleradorvillela.com',
          'pragma': 'no-cache',
          'referer': 'https://portal-saas.aceleradorvillela.com/',
          'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          'email': 'bianca.silva@villelabrasil.com.br',
          'senha': 'villela2022'
        })
    });

    const data = await response.json();
    const token = data['token'];

    // Salvar o token no localStorage
    localStorage.setItem('token', token);

    return token;
}

pesquisa.addEventListener('click', ()=>{
    let consulta = document.querySelector("input").value
    consultar(removerPontuacaoCNPJ(consulta));

})



async function consultar(cnpj) {
    try{
        let token = await obterToken();


        const response = await fetch(`https://back-ecac.aceleradorvillela.com/api/lead/buscar?cnpj=${cnpj}`, {
            method: 'GET',
            headers: {
                'authority': 'back-ecac.aceleradorvillela.com',
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'authorization': `Bearer ${token}`,
                'origin': 'https://portal.aceleradorvillela.com',
                'referer': 'https://portal.aceleradorvillela.com/',
                'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            }
        });

        const data = await response.json();


        return parcelamentos(data["id"], token);

    } catch (error) {
        localStorage.removeItem('token');
        let novoToken = await obterToken();
            
        // Refaz a consulta com o novo token
        const novaResposta = await fetch(`https://back-ecac.aceleradorvillela.com/api/lead/buscar?cnpj=${cnpj}`, {
            method: 'GET',
            headers: {
                'authority': 'back-ecac.aceleradorvillela.com',
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'authorization': `Bearer ${novoToken}`,
                'origin': 'https://portal.aceleradorvillela.com',
                'referer': 'https://portal.aceleradorvillela.com/',
                'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            }
        });

        // Obtém os dados da nova resposta
        const novosDados = await novaResposta.json();

        // Retorna os dados da nova consulta
        return parcelamentos(novosDados["id"], novoToken)
    }
    
}

async function parcelamentos(id, token) {
    try {
        const response = await fetch(`https://back-ecac.aceleradorvillela.com/api/leaddetalhes/${id}/parcelados`, {
            method: 'GET',
            headers: {
                'authority': 'back-ecac.aceleradorvillela.com',
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'authorization': `Bearer ${token}`,
                'origin': 'https://portal.aceleradorvillela.com',
                'referer': 'https://portal.aceleradorvillela.com/',
                'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            }
        });

        const data = await response.json();
        for (let i = 0; i < data.length; i++) {
            const lista = data[i];

            if(lista["situacao"] ==="DEFERIDO E CONSOLIDADO" && lista["qtdeDeParcelasConcedidas"] > 12) {

                let prima;
                let primo;
                let cnpj = lista['cpfCnpjDoOptante']
                let data_parcelamento = lista['mesAnoRequerimento']
                let modalidade = lista['tipoDeParcelamento']
                let nome_empresa = lista['nomeDoOptante']
                let qnt_parcelas = lista['qtdeDeParcelasConcedidas']
                let valor_consolidado = lista['valorConsolidado']
                let valor_principal = lista['valorDoPrincipal']
                let valor_parcelas;
                let qnt_parcelas_reducao;
                if (lista['tipoDeParcelamento'].indexOf("TRANSACAO EXCEPCIONAL") !== -1){
                    if(lista['tipoDeParcelamento'].indexOf("DEBITOS PREVIDENCIARIOS") !== -1) {
                        valor_parcelas = (valor_consolidado - (valor_consolidado*0.04))/48
                        prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.04))/48')
                    } else {
                        valor_parcelas = (valor_consolidado - (valor_consolidado*0.04))/(qnt_parcelas-12)
                        prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.04))/(qnt_parcelas-12)')
                    }
                    
                } else if (lista['modalidade'].indexOf("TRANSACAO EXTRAORDINARIA") !== -1){
                    if (lista['tipoDeParcelamento'].indexOf("PREVIDENCIARIO") !== -1) {
                        valor_parcelas = (valor_consolidado - (valor_consolidado*0.01))/48
                        prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.01))/48')
                    } else {
                        valor_parcelas = (valor_consolidado - (valor_consolidado*0.01))/(qnt_parcelas-12)
                        prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.01))/(qnt_parcelas-12)')
                    }
                } else if (lista['tipoDeParcelamento'].indexOf("EDITAL") !== -1){
                    if (lista['tipoDeParcelamento'].indexOf("PREVIDENCIARIO") !== -1) {
                        if (lista['modalidade'].indexOf("PEQUENO PORTE") !== -1) {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/48
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/48')
                        } else {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/54
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/54')
                        }
                    } else {
                        if (lista['modalidade'].indexOf("PEQUENO PORTE") !== -1) {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/(qnt_parcelas-12)
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/(qnt_parcelas-12)')
                        } else {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/(qnt_parcelas-6)
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/(qnt_parcelas-6)')
                        }
                    }
                } else if (lista['tipoDeParcelamento'].indexOf("CONVENCIONAL") !== -1){
                    if (lista['tipoDeParcelamento'].indexOf("NAO PREVIDENCIARIA") !== -1) {
                        valor_parcelas = valor_consolidado/qnt_parcelas
                        prima = console.log('valor_parcelas = valor_principal/qnt_parcelas')
                    } else {
                        valor_parcelas = valor_consolidado/60
                        prima = console.log('valor_parcelas = valor_principal/60')
                    }
                } else if (lista['tipoDeParcelamento'].indexOf("PERT") !== -1) {
                    if (lista['tipoDeParcelamento'].indexOf("DEBITOS PREVIDENCIARIOS") !== -1) {
                        valor_parcelas = (valor_consolidado - (valor_consolidado*0.15))/60
                        prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.15))/60')
                    } else {
                        valor_parcelas = (valor_consolidado - (valor_consolidado*0.15))/qnt_parcelas
                        prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.15))/qnt_parcelas')
                    }
                }



                if (lista["tipoDeParcelamento"].indexOf("PREVIDENCIARIO") !== -1) {
                    qnt_parcelas_reducao = 60
                } else {
                    qnt_parcelas_reducao = 145
                }
    
                inserirTabelas(cnpj, data_parcelamento, modalidade, nome_empresa, qnt_parcelas, valor_consolidado, valor_principal, valor_parcelas, qnt_parcelas_reducao)
            }


            
        }
    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
    }
    return prima
}

//parcelamentos();



function inserirTabelas(cnpj, data, modalidade, nome_empresa, qnt_parcelas, valor_consolidado, valor_principal, valor_parcelas, qnt_parcelas_reducao) {
    let reducao = (valor_consolidado-valor_principal)*0.85
    let principal_assessoria = valor_consolidado-reducao
    let entrada = (principal_assessoria*0.06)
    let primeiro_ano =  entrada/12
    let parcelas_restantes = (principal_assessoria-entrada)/(qnt_parcelas_reducao-12)
    let fluxo_mensal = valor_parcelas - primeiro_ano
    let fluxo_anual = fluxo_mensal*12
    let html = `
    <table class="sem-villela" cellspacing="0" cellpadding="5">
        <thead>
            <tr>
                <th class="nome-empresa">${nome_empresa}</th>
                <th class="cnpj">${formatarCNPJ(cnpj)}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="tipo-parcelamento" colspan="2">${modalidade}</td>
            </tr>
            <tr class="data-parcelamento">
                <td>DATA PARCELAMENTO</td>
                <td>${data}</td>
            </tr>
            <tr class="valor-consolidado">
                <td>VALOR CONSOLIDADO</td>
                <td>R$ ${formatarNumero(valor_consolidado)}</td>
            </tr>
            <tr class="valor-principal">
                <td>VALOR PRINCIPAL</td>
                <td>R$ ${formatarNumero(valor_principal)}</td>
            </tr>
            <tr class="num-parcelas">
                <td>Nº PARCELAS TOTAL</td>
                <td>${qnt_parcelas}</td>
            </tr>
            <tr class="valor-parcela">
                <td>VALOR PARCELA APROX. APÓS O PEDÁGIO</td>
                <td>R$ ${formatarNumero(valor_parcelas)}</td>
            </tr>
        </tbody>
    </table>

    <table class="com-villela" cellspacing="0" cellpadding="5">
        <thead>
            <tr>
                <th colspan="2">CONDIÇÕES APÓS ASSESSORIA DA VILLELA BRASIL BANK</th>
            </tr>
        </thead>
        <tbody>
            <tr class="valor-reducao">
                <td>REDUÇÃO DE ATÉ</td>
                <td>R$ ${formatarNumero(reducao)}</td>
            </tr>
            <tr class="valor-consolidado-villela">
                <td>VALOR APOX. APÓS ASSESSORIA</td>
                <td>R$ ${formatarNumero(principal_assessoria)}</td>
            </tr>
            <tr class="valor-parcela-villela">
                <td>Nº PARCELAS ATÉ</td>
                <td>${qnt_parcelas_reducao}</td>
            </tr>
            <tr class="primeiro-ano-villela">
                <td>1ª a 12ª</td>
                <td>R$ ${formatarNumero(primeiro_ano)}</td>
            </tr>
            <tr class="parcelas-restantes-villela">
                <td>13ª a ${qnt_parcelas_reducao}ª</td>
                <td>R$ ${formatarNumero(parcelas_restantes)}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <th>ECONOMIA MENSAL</th>
                <th>R$ ${formatarNumero(fluxo_mensal)}</td>
            </tr>
            <tr>
                <th>ECONOMIA NO 1º ANO</th>
                <th>R$ ${formatarNumero(fluxo_anual)}</td>
            </tr>
        </tfoot>
    </table>
    `
    document.body.innerHTML += html
}


function formatarNumero(numero) {
    // Converte o número para string e arredonda para duas casas decimais
    const numeroFormatado = parseFloat(numero).toFixed(2);
  
    // Divide em parte inteira e decimal
    const partes = numeroFormatado.split('.');
    const parteInteira = partes[0];
    const parteDecimal = partes[1];
  
    // Formata a parte inteira adicionando um ponto a cada três dígitos da direita para a esquerda
    const parteInteiraFormatada = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
    // Retorna a parte inteira e decimal formatadas
    return parteInteiraFormatada + ',' + parteDecimal;
}

function formatarCNPJ(cnpj) {
    // Remove caracteres não numéricos
    const numerosCNPJ = cnpj.replace(/\D/g, '');
  
    // Formata o CNPJ com máscara
    return numerosCNPJ.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
}

function removerPontuacaoCNPJ(cnpj) {
    // Remove caracteres não numéricos
    return cnpj.replace(/\D/g, '');
}

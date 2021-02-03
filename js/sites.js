
// function adicionarSite(nomeSite, nomeUsuario) {

// tudo o que faz quando abre
$(document).ready(function () {
    // pode mudar propriedades css
    // $('#btnSalverSite').css('background-color','red')
    $('#btnSalvarSite').on('click', adicionarSite)
});



function adicionarSite() {
    // alert('OK')

    // var objSite = {
    //     Title: '',
    //     Description: '',
    // }
    // alert(objSite.Description)
    // // igual so que mais dinamico
    // alert(objSite['Title'])
    // alert(objSite.Title)



    var objSite = {
        Title: $('#nomeInput').val(),
    }

    alert(objSite.Title)

}

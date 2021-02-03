var siteUrl = 'https://obuc.sharepoint.com/sites/Development/';
var currentUser = {};

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);

    if (results == null) {
        return '';
    } else {
        return results[1];
    }
}


$(document).ready(function () {

    getFormDigest()
    setInterval(getFormDigest, 60000)

    if ($('.date-input').length > 0) {
        $('.date-input').datepicker();
    }
    // LoadUsarios("https://monsanto365.sharepoint.com/teams/");



})

$(window).on('load', function () {

    $('.js--numerico').on('keypress', SoNumeros)

});

/************************************************************************************************************************************************/
/*                                                S H A R E P O I N T     R E S T     A P I                                                     */
/************************************************************************************************************************************************/
function AddAttachment(listName, $fileInput, spId, siteUrlArea) {

    return new Promise(function (resolve, reject) {

        f_GET_FILE_BUFFER($fileInput[0].files[0]).then(function (fileBuffer) {
            var fileName = $fileInput[0].files[0].name;

            var url = (returnString(siteUrlArea) !== '' ? siteUrlArea : siteUrl) + "_api/web/lists/GetByTitle('" + listName + "')/items('" + spId + "')/AttachmentFiles/add(FileName='" + fileName + "')";

            $.ajax({
                url: url,
                method: 'POST',
                data: fileBuffer,
                processData: false,
                async: false,
                headers: {
                    Accept: "application/json;odata=verbose",
                    "X-RequestDigest": strFormDigest
                }
            })

            resolve(true);

        });

    })

};

function RemoveAttachment(listName, fileName, spId, siteUrlArea) {

    return new Promise(function (resolve, reject) {

        var url = (returnString(siteUrlArea) !== '' ? siteUrlArea : siteUrl) + "_api/web/lists/GetByTitle('" + listName + "')/items('" + spId + "')/AttachmentFiles/getByFileName('" + fileName + "')";

        $.ajax({
            url: url,
            type: 'DELETE',
            contentType: "application/json; odata=verbose",
            async: false,
            headers: {
                Accept: "application/json;odata=verbose",
                "X-HTTP-Method": "DELETE",
                "X-RequestDigest": strFormDigest
            }
        });
        resolve(true);

    })


};

function PostListItems(listName, objColumns, siteUrlArea) {

    return new Promise(function (resolve, reject) {

        var obj = [];

        objColumns.__metadata = { type: 'SP.Data.' + listName.replace('_', '_x005f_').replace('%20', '_x0020_').replace('%20', '_x0020_') + 'ListItem' }

        var url = (siteUrlArea != undefined ? siteUrlArea : siteUrl) + "_api/web/lists/GetByTitle('" + listName + "')/items";

        $.ajax({
            url: url,
            type: "POST",
            async: false,
            contentType: "application/json; odata=verbose",
            data: JSON.stringify(objColumns),
            headers: {
                "Accept": "application/json; odata=verbose",
                "Content-Type": "application/json; odata=verbose",
                "X-RequestDigest": strFormDigest,
                "X-HTTP-Method": "POST"
            },
            success: function (data) {
                obj = data.d;
            },
            error: function (data) {
                swal('Erro', 'Conexão com o Sharepoint falhou. A página será recarregada !', 'error')
                // window.location.reload()
                reject('erro')
            }
        });
        resolve(obj);

    })


}

function PostGroupUser(listId, objColumns, siteUrlArea) {

    var obj = [];

    var url = (siteUrlArea != undefined ? siteUrlArea : siteUrl) + "_api/web/sitegroups(" + returnNumber(listId) + ")/users";
    console.log(objColumns)

    $.ajax({
        url: url,
        method: "POST",
        processData: false,
        async: false,
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(objColumns),
        headers: {
            "Accept": "application/json; odata=verbose",
            "X-RequestDigest": strFormDigest
        },
        success: function (data) {
            // respSharepoint = true             
        },
        error: function (error) {
            // respSharepoint = false
        }
    });
    return obj;
}

function UpdateListItem(listName, objColumns, spId, siteUrlArea) {

    return new Promise(function (resolve, reject) {
        var obj = [];

        objColumns.__metadata = { 'type': 'SP.Data.' + listName + 'ListItem' }

        url = (siteUrlArea != undefined ? siteUrlArea : siteUrl) + "_api/web/lists/GetByTitle('" + listName + "')/items('" + spId + "')";

        $.ajax({
            url: url,
            method: "POST",
            processData: false,
            async: false,
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(objColumns),
            headers: {
                "Accept": "application/json; odata=verbose",
                "X-RequestDigest": strFormDigest,
                "X-HTTP-Method": "MERGE",
                "If-Match": "*"
            },
            success: function (data) {
                obj = data;
            },
            error: function (error) {
                swal('Erro', 'Conexão com o Sharepoint falhou. A página será recarregada !', 'error')
                reject('erro');
                // window.location.reload()
            }
        });
        resolve(obj);
    });
}

function DeleteListItem(listName, spId, siteUrlArea) {

    return new Promise(function (resolve, reject) {
        $.ajax({
            url: (siteUrlArea != undefined ? siteUrlArea : siteUrl) + "_api/web/lists/GetByTitle('" + listName + "')/items('" + spId + "')",
            method: "DELETE",
            headers: {
                "Accept": "application/json; odata=verbose",
                "X-RequestDigest": strFormDigest,
                "If-Match": "*"
            },
            success: function (data) {
                resolve(true);
            },
            error: function (error) {
                swal('Erro', 'Conexão com o Sharepoint falhou!', 'error')
                reject(false);
            }
        });
    })


}

function DeleteGroupUser(listId, loginName, siteUrlArea) {

    var obj = [];

    $.ajax({
        url: (siteUrlArea != undefined ? siteUrlArea : siteUrl) + "_api/web/sitegroups(" + returnNumber(listId) + ")/users/removebyid(" + returnNumber(loginName) + ")",
        type: "POST",
        contentType: "application/json;odata=verbose",
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": strFormDigest,
            "IF-MATCH": "*",
            "X-HTTP-Method": "DELETE",
        },
        success: function (data) {
        },
        error: function (data) {
        }
    });

    return obj;
}

function GetListItems(listName, listSelect, async, siteUrlArea, obj) {

    if (async === undefined || async === null) {
        async = false;
    }

    if (obj === undefined) {
        obj = [];
    }

    var url = (siteUrlArea != undefined ? siteUrlArea : siteUrl) + "_api/web/lists/getbytitle('" + listName + "')/items" + listSelect
    obj = GetListItemsUrl(url, obj, async)
    return obj
}

function GetListItemsById(listId, listSelect, async, siteUrlArea) {

    if (async === undefined || async === null) {
        async = false;
    }

    var obj = [];
    var url = (siteUrlArea != undefined ? siteUrlArea : siteUrl) + "_api/web/lists/getbyid('" + listId + "')/items" + listSelect
    obj = GetListItemsUrl(url, obj, async)
    return obj
}
function GetListFields(listName, listSelect, async, siteUrlArea) {

    if (async === undefined || async === null) {
        async = false;
    }

    var obj = [];
    var url = (siteUrlArea != undefined ? siteUrlArea : siteUrl) + "_api/web/lists/getbytitle('" + listName + "')/fields" + listSelect
    obj = GetListItemsUrl(url, obj, async)
    return obj
}

function GetListGroup(listId, listSelect, async) {

    if (async === undefined || async === null) {
        async = false;
    }

    var obj = [];
    var url = siteUrl + "_api/web/sitegroups(" + listId + ")/users" + listSelect
    obj = GetListItemsUrl(url, obj, async)
    return obj
}

function GetListItemsUrl(url, obj, async) {

    $.ajax({
        url: url,
        method: "GET",
        async: async,
        headers: {
            "Accept": "application/json; odata=verbose",
            "Content-Type": "application/json; odata=verbose"
        },
        success: function (data) {
            obj = obj.concat(data.d.results);
            if (data.d.__next) {
                url = data.d.__next;
                obj = GetListItemsUrl(url, obj, async);
            }
        },
        error: function (error) {
            obj = []
        }

    });
    return obj;
}

function getFormDigest() {
    $.ajax({
        url: siteUrl + "/_api/contextinfo",
        method: "POST",
        async: false,
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            strFormDigest = data.d.GetContextWebInformation.FormDigestValue
        },
        error: function (data) {
            console.log(data.message);
        }
    });
}

function VerifyAccess(groupId) {

    $.getJSON(siteUrl + "/_api/web/currentuser")
        .done(function (data) {
            currentUser = data;
            console.log(currentUser)
            var arrAdmin = GetListGroup(groupId, '');
            arrAdmin = arrAdmin.filter(function (x) { return x.LoginName === currentUser.LoginName });

            if (arrAdmin.length > 0) {
                $('.content').removeClass('d-none');
            } else {
                $('.content').empty().append(
                    '<img class="access-denied" src="https://bayergroup.sharepoint.com/sites/006258/Portal/images/access-denied.png" alt="Access Denied!">'
                );
                $('.content').removeClass('d-none');
                $('.content').addClass('d-flex');
            }

            // console.log(data)
            // userMonsanto = currentUser.LoginName.substring(18, currentUser.LoginName.indexOf('@'));
            // userName = currentUser.Title;
            // userID = currentUser.Id
            // $('#userSpan').html('<strong>' + userMonsanto.toUpperCase() + '</strong> - ' + userType);

        })

}

function IsAdmin(groupId) {

    return new Promise(function (resolve, reject) {
        $.getJSON(siteUrl + "/_api/web/currentuser")
            .done(function (data) {
                currentUser = data;
                console.log(currentUser)
                var arrAdmin = GetListGroup(groupId, '');
                arrAdmin = arrAdmin.filter(function (x) { return x.LoginName === currentUser.LoginName });

                resolve(arrAdmin.length > 0);
            })
    });

}



function GetCurrentUser() {

    $.getJSON(siteUrl + "/_api/web/currentuser")
        .done(function (data) {
            currentUser = data;
        })

}

/************************************************************************************************************************************************/
/*                                                        F I L E     T O     B U F F E R                                                       */
/************************************************************************************************************************************************/
function f_GET_FILE_BUFFER(file) {
    var deferred = $.Deferred();
    var reader = new FileReader();
    reader.onload = function (e) { deferred.resolve(e.target.result); }
    reader.onerror = function (e) { deferred.reject(e.target.error); }
    reader.readAsArrayBuffer(file);
    return deferred.promise();
};


/************************************************************************************************************************************************/
/*                                                             S O     N U M E R O S                                                            */
/************************************************************************************************************************************************/
function SoNumeros(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode === 8 || event.keyCode === 46) {
        return true;
    } else if (key < 48 || key > 57) {
        return false;
    } else {
        return true;
    }
}

$(window).resize(MaxHeightForm)

function MaxHeightForm() {

    setTimeout(function () {
        var footerHeight = $('#footerImage').height();

        $('.row-form').css('maxHeight', 'calc(100vh - 8.2rem - ' + footerHeight + 'px)')
    }, 1000)

}

/************************************************************************************************************************************************/
/*                                                    F I L T E R A B L E     T A B L E                                                         */
/************************************************************************************************************************************************/

$('.table-filter input').keyup(function (e) {
    /* Ignore tab key */
    var code = e.keyCode || e.which;
    if (code == '9') return;

    /* Useful DOM data and selectors */
    var $table = $(this).parents('.table-filter'),
        $rows = $table.find('tbody tr');

    $table.find('tbody .no-result').remove();
    $rows.show();

    $(this).parents('.table-filter').find('th input').each(function (index) {
        var $input = $(this),
            inputContent = $input.val().toLowerCase().trim(),
            column = $table.find('th').index($input.parents('th'));

        $rows.filter(function () {
            var value = $(this).find('td').eq(column).text().toLowerCase().trim();
            return value.indexOf(inputContent) === -1;
        }).hide()
    })
    /* Clean previous no-result if exist */
    /* Show all rows, hide filtered ones */

    /* Prepend no-result row if all rows are filtered */
    if ($rows.length == $rows.filter('[style*="display: none"]').length) {
        $table.find('tbody').prepend($('<tr class="no-result text-center"><td colspan="' + $table.find('th').length + '" style="width: ' + $table.width() + 'px">Nenhum registro encontrado</td></tr>'));
    }

});



/************************************************************************************************************************************************/
/*                                                                    O T H E R S                                                               */
/************************************************************************************************************************************************/
function returnString(text, emptyString) {

    if (text === null || text === undefined) {
        if (emptyString === null || emptyString === undefined) {
            return '';
        } else {
            return emptyString;
        }
    } else {
        return text.toString();
    }

};

function returnNumber(value, defaultReturn) {

    if (value === null || value === undefined || value == '' || !$.isNumeric(value)) {
        if (defaultReturn === undefined) {
            return 0;
        } else {
            return defaultReturn;
        }
    } else {
        return Number(value);
    }

};

function SoNumeros(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode === 8 || event.keyCode === 46) {
        return true;
    } else if (key < 48 || key > 57) {
        return false;
    } else {
        return true;
    }
}

function returnIDUsers($multiPeople) {

    var arrUsers = [];

    $multiPeople.find('.divPeople').each(function () {
        arrUsers.push(returnNumber($(this).attr('iduser')));
    })

    return arrUsers;

}

$('.attachment-input input').off().on('change', function () {
    $(this).siblings('a').remove();
    if ($(this)[0].files[0] !== undefined) { $(this).parent().prepend('<a href="#">' + $(this)[0].files[0].name + '</a>') };
});

function readUrl(input, imageSrc) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            imageSrc.attr('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }

}

// a and b are javascript Date objects
function dateDiffInDays(a, b) {

    const _MS_PER_DAY = 1000 * 60 * 60 * 24;

    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

function arrayUnique(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}
/**
 * @package ImpressPages
 *
 *
 */

$(document).ready(function () {
    "use strict";


    initializeTreeManagement('tree');

    $('#tree').bind('select_node.jstree', updatePageForm);
    $('#tree').bind('close_node.jstree', closeNode);
    $('#tree').bind('select_node.jstree', function (e, data) {
        // expands menu item when it is selected (shows children)

        $('#tree').jstree('open_node', data.rslt.obj);
    });

    $('#tree').bind('refresh.jstree', function (e, data) {
        // when new page is created, this method immediately shows it by opening parent node
        $('#tree').jstree('open_node', data.rslt.obj);
    });

    $('#controlls').delegate('#buttonNewPage', 'click', createPageForm);
    $('#controlls').delegate('#buttonDeletePage', 'click', deletePageConfirm);
    $('#controlls').delegate('#buttonCopyPage', 'click', copyPage);
    $('#controlls').delegate('#buttonPastePage', 'click', pastePage);

    $('#formCreatePage').bind('submit', function () {
        createPage();
        return false;
    });




});





function editPage() {
    var tree = jQuery.jstree._reference('#tree');
    var node = tree.get_selected();

    var data = Object();
    data.id = node.attr('id');
    data.pageId = node.attr('pageId');
    data.zoneName = node.attr('zoneName');
    data.websiteId = node.attr('websiteId');
    data.languageId = node.attr('languageId');
    data.zoneName = node.attr('zoneName');
    data.type = node.attr('rel');
    data.aa = 'Pages.getPageLink';

    $.ajax({
        type: 'GET',
        url: ip.baseUrl,
        data: data,
        success: editPageResponse,
        dataType: 'json'
    });
}

function editPageResponse(response) {
    if (!response || !response.link) {
        return;
    }

    document.location = response.link;

}

function closeNode(event, data) {

    node = $(data.rslt.obj[0]);
    var data = new Object;


    data.languageId = node.attr('languageId');
    data.rel = node.attr('rel');
    data.pageId = node.attr('pageId');
    data.type = node.attr('rel');
    data.zoneName = node.attr('zoneName');
    data.languageId = node.attr('languageId');
    data.websiteId = node.attr('websiteId');
    data.securityToken = ip.securityToken;

    data.aa = 'Pages.closePage';

    $.ajax({
        type: 'POST',
        url: ip.baseUrl,
        data: data,
        dataType: 'json'
    });
}

/**
 * Open new page form
 */
function createPageForm() {

    var node = treeSelectedNode('#tree');

    /*
    var buttons = new Array;

    buttons.push({ text: textSave, click: createPage});
    buttons.push({ text: textCancel, click: function () {
        $(this).dialog("close")
    } });


    $('#createPageForm').dialog({
        autoOpen: true,
        modal: true,
        resizable: false,
        buttons: buttons
    });*/

    $('#createPageForm')
        .modal()
        .find('.ipsSubmit').on('click', createPage);

    return;

}


/**
 * Post data to create a new page
 */
function createPage() {

    $('#createPageForm').modal('hide');


    var data = Object();

    var node = treeSelectedNode('#tree');


    if (node) {
        data.languageId = node.attr('languageId');
        data.rel = node.attr('rel');
        data.pageId = node.attr('pageId');
        data.type = node.attr('rel');
        data.zoneName = node.attr('zoneName');
        data.languageId = node.attr('languageId');
        data.websiteId = node.attr('websiteId');
    }
    data.navigationTitle = $('#createPagenavigationTitle').val();
    data.securityToken = ip.securityToken;


    $('#createPageForm #createPagenavigationTitle').val(''); // remove value from input field

    data.aa = 'Pages.createPage';

    $.ajax({
        type: 'POST',
        url: ip.baseUrl,
        data: data,
        success: createPageResponse,
        dataType: 'json'
    });
}

/**
 * Create page post response
 *
 * @param response
 */

function createPageResponse(response) {
    if (!response) {
        return;
    }

    if (response.refreshId) {
        var tree = jQuery.jstree._reference('#tree');
        tree.refresh('#' + response.refreshId);
    }
}

/**
 * Delete page request confirm
 */
function deletePageConfirm() {
    var tree = jQuery.jstree._reference('#tree');
    var node = tree.get_selected();

    if (!node || (node.attr('rel') != 'page')) {
        return;
    }

    if (confirm(deleteConfirmText)) {

        var data = Object();
        data.id = node.attr('id');
        data.pageId = node.attr('pageId');
        data.zoneName = node.attr('zoneName');
        data.websiteId = node.attr('websiteId');
        data.languageId = node.attr('languageId');
        data.type = node.attr('rel');
        data.aa = 'Pages.deletePage';
        data.securityToken = ip.securityToken;

        $.ajax({
            type: 'POST',
            url: ip.baseUrl,
            data: data,
            success: deletePageResponse,
            dataType: 'json'
        });
    }
}

/**
 * Delete page request
 */
function deletePageResponse(response) {
    if (response && response.status == 'success') {
        var tree = jQuery.jstree._reference('#tree');
        var selectedNode = tree.get_selected();
        tree.deselect_all(); //without it get_selected returns the same deleted page

        var path = tree.get_path(selectedNode, true);

        tree.refresh('#' + path[path.length - 2]);
    } else {
        alert('Unexpected error');
    }
}

/**
 * Send request for page update form
 *
 * @param event
 * @param data
 */
function updatePageForm(event, data) {
    var tree = jQuery.jstree._reference('#tree');
    var node = tree.get_selected();

    switch (node.attr('rel')) {
        case 'page':
            $('#buttonNewPage').prop('disabled', false);
            $('#buttonDeletePage').prop('disabled', false);
            $('#buttonCopyPage').prop('disabled', false);

            if (tree.copiedNode) {
                $('#buttonPastePage').prop('disabled', false);
            } else {
                $('#buttonPastePage').prop('disabled', true);
            }
            break;
        case 'website':
        case 'language':
            $('#buttonNewPage').prop('disabled', true);
            $('#buttonDeletePage').prop('disabled', true);
            $('#buttonCopyPage').prop('disabled', true);
            $('#buttonPastePage').prop('disabled', true);
            break;
        case 'zone':
            $('#buttonNewPage').prop('disabled', false);
            $('#buttonDeletePage').prop('disabled', true);
            $('#buttonCopyPage').prop('disabled', true);
            if (tree.copiedNode) {
                $('#buttonPastePage').prop('disabled', false);
            } else {
                $('#buttonPastePage').prop('disabled', true);
            }
            break;
    }

    if (node.attr('websiteId') != 0) {
        $('#buttonNewPage').prop('disabled', true);
        $('#buttonDeletePage').prop('disabled', true);
        $('#buttonPastePage').prop('disabled', true);
        $('#pageProperties').html('');
        return;
    }


    switch (node.attr('rel')) {
        case 'page':
            var data = Object();
            data.id = node.attr('id');
            data.pageId = node.attr('pageId');
            data.zoneName = node.attr('zoneName');
            data.websiteId = node.attr('websiteId');
            data.languageId = node.attr('languageId');
            data.type = node.attr('rel');
            data.aa = 'Pages.getPageForm';
            data.securityToken = ip.securityToken;


            $.ajax({
                type: 'GET',
                url: ip.baseUrl,
                data: data,
                success: updatePageFormResponse,
                dataType: 'json'
            });
            break;
        case 'zone':
            ipPagesZoneProperties.open(node.attr('websiteId'), node.attr('zoneName'), node.attr('languageId'));
            break;
        case 'language':
            ipPagesLanguageProperties.open(node.attr('websiteId'), node.attr('languageId'));
            break;
        default:
            $('#pageProperties').html('');
    }

}



/**
 * Select node request response.
 *
 * @param response
 */
function updatePageFormResponse(response) {
    if (response && response.html) {
        $('#pageProperties').html(response.html);

        var tree = jQuery.jstree._reference('#tree');

        // store pageId to know whish page data being edited
        tree.selectedPageId = response.page.pageId;
        tree.selectedPageZoneName = response.page.zoneName;

        $('#formGeneral input[name="navigationTitle"]').val(response.page.navigationTitle);
        $('#formGeneral input[name="visible"]').attr('checked', response.page.visible == 1 ? true : false);
        $('#formGeneral input[name="createdOn"]').val(response.page.createdOn.substr(0, 10));
        $('#formGeneral input[name="lastModified"]').val(
            response.page.lastModified.substr(0, 10));

        $('#formSEO input[name="pageTitle"]').val(response.page.pageTitle);
        $('#formSEO textarea[name="keywords"]').val(response.page.keywords);
        $('#formSEO textarea[name="description"]').val(response.page.description);
        $('#formSEO input[name="url"]').val(response.page.url);
        $('#formAdvanced input[name="type"][name="type"][value="' + response.page.type + '"]').attr('checked', 1);
        $('#formAdvanced input[name="redirectURL"]').val(response.page.redirectURL);

        $("#pageProperties form").bind("submit", function () {
            updatePage();
            return false;
        });
        $("#internalLinkingIcon").bind("click", openInternalLinkingTree);

        /*$('#pageProperties').tabs('destroy');
        $('#pageProperties').tabs();*/

    }
}

/**
 * Save selected and modified page
 */
function updatePage() {
    var tree = jQuery.jstree._reference('#tree');

    var data = Object();

    data.pageId = tree.selectedPageId; // we have stored this ID before
    data.zoneName = tree.selectedPageZoneName; // we have stored this ID before
    data.navigationTitle = $('#formGeneral input[name="navigationTitle"]').val();
    data.visible = $('#formGeneral input[name="visible"]').attr('checked') ? 1 : 0;
    data.createdOn = $('#formGeneral input[name="createdOn"]').val();
    data.lastModified = $('#formGeneral input[name="lastModified"]').val();

    data.pageTitle = $('#formSEO input[name="pageTitle"]').val();
    data.keywords = $('#formSEO textarea[name="keywords"]').val();
    data.description = $('#formSEO textarea[name="description"]').val();
    data.url = $('#formSEO input[name="url"]').val();
    data.type = $('#formAdvanced input:checked[name="type"]').val();
    data.redirectURL = $('#formAdvanced input[name="redirectURL"]').val();
    data.layout = $('#formLayout select[name="layout"]').val();

    data.aa = 'Pages.updatePage';
    data.securityToken = ip.securityToken;


    $.ajax({
        type: 'POST',
        url: ip.baseUrl,
        data: data,
        success: updatePageResponse,
        dataType: 'json'
    });

}

/**
 * Save updated page response
 *
 * @param response
 */
function updatePageResponse(response) {
    if (!response) {
        return;
    }

    $('#pageProperties .error').hide();
    if (response.status == 'success') {
        var tree = jQuery.jstree._reference('#tree');
        var selectedNode = tree.get_selected()
        var path = tree.get_path(selectedNode, true);

        tree.refresh('#' + path[path.length - 2]);
    } else {
        if (response.errors) {
            for (var errorKey in response.errors) {
                var error = response.errors[errorKey];
                $('#' + error.field + 'Error').text(error.message).show();
                $('#' + error.field + 'Error').text(error.message).css('display',
                    'block');
            }
        }
    }

}

/**
 *
 * @param e
 * @param data
 */
function movePage(e, moveData) {
    moveData.rslt.o.each(function (i) {
        var data = Object();

        data.pageId = $(this).attr("pageId");
        data.zoneName = $(this).attr('zoneName');
        data.languageId = $(this).attr('languageId');
        data.websiteId = $(this).attr('websiteId');
        data.type = $(this).attr('rel');
        data.parentId = moveData.rslt.op.attr("pageId");
        data.position = moveData.rslt.cop;
        data.destinationPageId = moveData.rslt.np.attr("pageId");
        data.destinationZoneName = moveData.rslt.np.attr("zoneName");
        data.destinationLanguageId = moveData.rslt.np.attr("languageId");
        data.destinationPageType = moveData.rslt.np.attr("rel");
        data.destinationPosition = moveData.rslt.cp + i;
        data.aa = 'Pages.movePage';
        data.securityToken = ip.securityToken;


        //if we move withing the same parent, fix destination position value.
        if (
            data.zoneName == data.dstinationZoneName &&
                data.languageId == data.destinationLanguageId &&
                data.parentId == data.destinationPageId &&
                data.data.destinationPositin > data.position
            ) {
            data.destinationPosition = data.destinationPosition - 1;
        }

        var tree = jQuery.jstree._reference('#tree');
        tree.destinationId = moveData.rslt.np.attr("id");

        $.ajax({
            type: 'POST',
            url: ip.baseUrl,
            data: data,
            success: movePageResponse,
            dataType: 'json'
        });
    });


};

function movePageResponse(response) {
    if (response && response.status == 'success') {
        var tree = jQuery.jstree._reference('#tree');
        tree.refresh('#' + tree.destinationId);
    }
}

/**
 * Mark current page as copied
 */
function copyPage() {

    var tree = jQuery.jstree._reference('#tree');
    var node = tree.get_selected();

    if (!node || (node.attr('rel') != 'page')) {
        return;
    }

    tree.copiedNode = node;
    $('#buttonPastePage').prop('disabled', false);

}

/**
 * Duplicate and move the page, selected as copied
 */
function pastePage() {
    var tree = jQuery.jstree._reference('#tree');
    var selectedNode = tree.get_selected();
    if (!tree.copiedNode || !selectedNode || selectedNode.attr('rel') != 'zone' && selectedNode.attr('rel') != 'page') {
        return;
    }

    var copiedNode = tree.copiedNode;

    var data = Object();

    data.pageId = copiedNode.attr('pageId');
    data.zoneName = copiedNode.attr('zoneName');
    data.languageId = copiedNode.attr('languageId');
    data.websiteId = copiedNode.attr('websiteId');
    data.type = copiedNode.attr('rel');
    data.destinationPageId = selectedNode.attr("pageId");
    data.destinationPageType = selectedNode.attr('rel');
    data.destinationZoneName = selectedNode.attr('zoneName');
    data.destinationLanguageId = selectedNode.attr('languageId');
    data.aa = 'Pages.copyPage';
    data.securityToken = ip.securityToken;


    tree.destinationId = selectedNode.attr('id');

    $.ajax({
        type: 'POST',
        url: ip.baseUrl,
        data: data,
        success: pastePageResponse,
        dataType: 'json'
    });

}

function pastePageResponse(response) {
    if (response && response.status == 'success') {
        var tree = jQuery.jstree._reference('#tree');
        tree.refresh('#' + tree.destinationId);
        // known bug. If page is pasted into empty folder, it can't be opened
        // automatically, because refresh function does not provide a call back
        // after refresh.
    }
}

/**
 * Select page on internal linking popup
 *
 * @param event
 * @param data
 */
function treePopupSelect(event, data) {

    var tree = jQuery.jstree._reference('#treePopup');
    var node = tree.get_selected();

    var data = Object();
    data.id = node.attr('id');
    data.pageId = node.attr('pageId');
    data.zoneName = node.attr('zoneName');
    data.websiteId = node.attr('websiteId');
    data.languageId = node.attr('languageId');
    data.zoneName = node.attr('zoneName');
    data.type = node.attr('rel');
    data.aa = 'Pages.getPageLink';

    $.ajax({
        type: 'GET',
        url: ip.baseUrl,
        data: data,
        success: treePopupSelectResponse,
        dataType: 'json'
    });
}


/**
 * Select page on internal linking popup response
 *
 * @param response
 */
function treePopupSelectResponse(response) {
    if (response && response.link) {
        $('#formAdvanced input[name="redirectURL"]').val(response.link);
        $('#formAdvanced input[name="type"][value="redirect"]').attr("checked",
            "checked");
    }

    closeInternalLinkingTree();
}

function openInternalLinkingTree() {
    var tree = jQuery.jstree._reference('#treePopup');
    if (!tree) {
        initializeTreeManagement('treePopup');
    }
    $('#treePopup').dialog({
        autoOpen: true,
        modal: true,
        height: ($(window).height() - 200),
        width: 300
    })
    $('.ui-widget-overlay').bind('click', closeInternalLinkingTree)

}

function closeInternalLinkingTree() {
    $('.ui-widget-overlay').unbind('click');
    $('#treePopup').dialog('close');
}

/**
 * Custom function to overcome some jsTree bug.
 * @param treeId
 * @return node
 */
function treeSelectedNode(treeId) {
    var tree = jQuery.jstree._reference(treeId);
    var node = tree.get_selected();
    if (node.attr('id')) {
        return node;
    } else {
        return false;
    }
}

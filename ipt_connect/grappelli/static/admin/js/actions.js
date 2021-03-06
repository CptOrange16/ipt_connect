/*global _actions_icnt, gettext, interpolate, ngettext*/
/**
 * GRAPPELLI ACTIONS.JS
 * minor modifications compared with the original js
 *
 */

(function($) {
    'use strict';
    var lastChecked;
    $.fn.actions = function(opts) {
        var options = $.extend({}, $.fn.actions.defaults, opts);
        var actionCheckboxes = $(this);
        var list_editable_changed = false;
        var showQuestion = function() {
            $(options.acrossClears).hide();
            $(options.acrossQuestions).show();
            $(options.allContainer).hide();
        },
        showClear = function() {
            $(options.acrossClears).show();
            $(options.acrossQuestions).hide();
            $(options.actionContainer).toggleClass(options.selectedClass);
            $(options.allContainer).show();
            $(options.counterContainer).hide();
        },
        reset = function() {
            $(options.acrossClears).hide();
            $(options.acrossQuestions).hide();
            $(options.allContainer).hide();
            $(options.counterContainer).show();
        },
        clearAcross = function() {
            reset();
            $(options.acrossInput).val(0);
            $(options.actionContainer).removeClass(options.selectedClass);
        },
        checker = function(checked) {
            if (checked) {
                showQuestion();
            } else {
                reset();
            }
            $(actionCheckboxes).prop("checked", checked)
                .parent().parent().toggleClass(options.selectedClass, checked);
        },
        updateCounter = function() {
            var sel = $(actionCheckboxes).filter(":checked").length;
            // _actions_icnt is defined in the generated HTML
            // and contains the total amount of objects in the queryset
            $(options.counterContainer).html(interpolate(
            ngettext('%(sel)s of %(cnt)s selected', '%(sel)s of %(cnt)s selected', sel), {
                sel: sel,
                cnt: _actions_icnt
            }, true));
            $(options.allToggle).prop("checked", function() {
                var value;
                if (sel === actionCheckboxes.length) {
                    value = true;
                    showQuestion();
                } else {
                    value = false;
                    clearAcross();
                }
                return value;
            });
        };
        // Show counter by default
        $(options.counterContainer).show();
        // Check state of checkboxes and reinit state if needed
        $(this).filter(":checked").each(function(i) {
            $(this).parent().parent().toggleClass(options.selectedClass);
            updateCounter();
            if ($(options.acrossInput).val() === 1) {
                showClear();
            }
        });
        $(options.allToggle).show().click(function() {
            checker($(this).prop("checked"));
            updateCounter();
        });
        $("a", options.acrossQuestions).click(function(event) {
            event.preventDefault();
            $(options.acrossInput).val(1);
            showClear();
        });
        $("a", options.acrossClears).click(function(event) {
            event.preventDefault();
            $(options.allToggle).prop("checked", false);
            clearAcross();
            checker(0);
            updateCounter();
        });
        lastChecked = null;
        $(actionCheckboxes).click(function(event) {
            if (!event) { event = window.event; }
            var target = event.target ? event.target : event.srcElement;
            if (lastChecked && $.data(lastChecked) !== $.data(target) && event.shiftKey === true) {
                var inrange = false;
                $(lastChecked).prop("checked", target.checked)
                    .parent().parent().toggleClass(options.selectedClass, target.checked);
                $(actionCheckboxes).each(function() {
                    if ($.data(this) === $.data(lastChecked) || $.data(this) === $.data(target)) {
                        inrange = (inrange) ? false : true;
                    }
                    if (inrange) {
                        $(this).prop("checked", target.checked)
                            .parent().parent().toggleClass(options.selectedClass, target.checked);
                    }
                });
            }
            $(target).parent().parent().toggleClass(options.selectedClass, target.checked);
            lastChecked = target;
            updateCounter();
        });
        // GRAPPELLI CUSTOM: REMOVED ALL JS-CONFIRMS
        // TRUSTED EDITORS SHOULD KNOW WHAT TO DO

        // GRAPPELLI CUSTOM: submit on select
        $(options.actionSelect).attr("autocomplete", "off").change(function(evt){
            $(this).parents("form").submit();
        });
    };
    /* Setup plugin defaults */
    $.fn.actions.defaults = {
        actionContainer: "div.grp-changelist-actions",
        counterContainer: "li.grp-action-counter span.grp-action-counter",
        allContainer: "div.grp-changelist-actions li.grp-all",
        acrossInput: "div.grp-changelist-actions input.select-across",
        acrossQuestions: "div.grp-changelist-actions li.grp-question",
        acrossClears: "div.grp-changelist-actions li.grp-clear-selection",
        allToggle: "#action-toggle",
        selectedClass: "grp-selected",
        actionSelect: "div.grp-changelist-actions select"
    };
})(grp.jQuery);

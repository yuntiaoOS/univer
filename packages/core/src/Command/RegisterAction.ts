import { ACTION_NAMES } from '../Const';
import {
    AddMergeAction,
    AddNamedRangeAction,
    ClearRangeAction,
    DeleteNamedRangeAction,
    DeleteRangeAction,
    InsertColumnAction,
    InsertColumnDataAction,
    InsertRangeAction,
    InsertRowAction,
    InsertRowDataAction,
    InsertSheetAction,
    RemoveColumnAction,
    RemoveColumnDataAction,
    RemoveMergeAction,
    RemoveRowAction,
    RemoveRowDataAction,
    RemoveSheetAction,
    SetBorderAction,
    SetColumnHideAction,
    SetColumnShowAction,
    SetColumnWidthAction,
    SetHiddenGridlinesAction,
    SetNamedRangeAction,
    SetRangeDataAction,
    SetRangeFormatAction,
    SetRangeFormulaAction,
    SetRangeNoteAction,
    SetRangeStyleAction,
    SetRangeValueAction,
    SetRightToLeftAction,
    SetRowHeightAction,
    SetRowHideAction,
    SetRowShowAction,
    SetSelectionActivateAction,
    SetSheetOrderAction,
    SetTabColorAction,
    SetWorkSheetActivateAction,
    SetWorkSheetHideAction,
    SetWorkSheetNameAction,
    SetWorkSheetStatusAction,
    SetZoomRatioAction,
} from '../Sheets/Action';
import { CommandManager } from './CommandManager';

/**
 * All Commands are registered statically. For each new Command, a static registration method must be added here.
 */

CommandManager.register(ACTION_NAMES.INSERT_ROW_DATA_ACTION, InsertRowDataAction);
CommandManager.register(ACTION_NAMES.INSERT_ROW_ACTION, InsertRowAction);
CommandManager.register(ACTION_NAMES.REMOVE_ROW_DATA_ACTION, RemoveRowDataAction);
CommandManager.register(ACTION_NAMES.REMOVE_ROW_ACTION, RemoveRowAction);
CommandManager.register(ACTION_NAMES.SET_RANGE_STYLE_ACTION, SetRangeStyleAction);
CommandManager.register(
    ACTION_NAMES.SET_WORKSHEET_STATUS_ACTION,
    SetWorkSheetStatusAction
);
CommandManager.register(
    ACTION_NAMES.SET_SELECTION_ACTION,
    SetSelectionActivateAction
);
CommandManager.register(ACTION_NAMES.SET_RANGE_DATA_ACTION, SetRangeDataAction);
CommandManager.register(ACTION_NAMES.SET_RANGE_VALUE_ACTION, SetRangeValueAction);
CommandManager.register(ACTION_NAMES.DELETE_RANGE_ACTION, DeleteRangeAction);
CommandManager.register(ACTION_NAMES.CLEAR_RANGE_ACTION, ClearRangeAction);
CommandManager.register(ACTION_NAMES.INSERT_RANGE_ACTION, InsertRangeAction);
CommandManager.register(ACTION_NAMES.SET_TAB_COLOR_ACTION, SetTabColorAction);
CommandManager.register(ACTION_NAMES.HIDE_SHEET_ACTION, SetWorkSheetHideAction);
CommandManager.register(
    ACTION_NAMES.SET_WORKSHEET_ACTIVATE_ACTION,
    SetWorkSheetActivateAction
);
CommandManager.register(ACTION_NAMES.SET_HIDE_ROW_ACTION, SetRowHideAction);
CommandManager.register(ACTION_NAMES.SET_SHOW_ROW_ACTION, SetRowShowAction);
CommandManager.register(ACTION_NAMES.SET_HIDE_COLUMN_ACTION, SetColumnHideAction);
CommandManager.register(ACTION_NAMES.SET_SHOW_COLUMN_ACTION, SetColumnShowAction);
CommandManager.register(ACTION_NAMES.ADD_MERGE_ACTION, AddMergeAction);
CommandManager.register(ACTION_NAMES.REMOVE_MERGE_ACTION, RemoveMergeAction);
CommandManager.register(
    ACTION_NAMES.SET_WORKSHEET_NAME_ACTION,
    SetWorkSheetNameAction
);
CommandManager.register(
    ACTION_NAMES.SET_HIDDEN_GRIDLINES_ACTION,
    SetHiddenGridlinesAction
);
CommandManager.register(ACTION_NAMES.SET_COLUMN_WIDTH_ACTION, SetColumnWidthAction);
CommandManager.register(ACTION_NAMES.SET_ROW_HEIGHT_ACTION, SetRowHeightAction);
CommandManager.register(ACTION_NAMES.SET_BORDER_ACTION, SetBorderAction);
CommandManager.register(ACTION_NAMES.SET_RIGHT_TO_LEFT_ACTION, SetRightToLeftAction);
CommandManager.register(
    ACTION_NAMES.INSERT_COLUMN_DATA_ACTION,
    InsertColumnDataAction
);
CommandManager.register(
    ACTION_NAMES.REMOVE_COLUMN_DATA_ACTION,
    RemoveColumnDataAction
);
CommandManager.register(ACTION_NAMES.INSERT_COLUMN_ACTION, InsertColumnAction);
CommandManager.register(ACTION_NAMES.REMOVE_COLUMN_ACTION, RemoveColumnAction);
CommandManager.register(
    ACTION_NAMES.DELETE_NAMED_RANGE_ACTION,
    DeleteNamedRangeAction
);
CommandManager.register(ACTION_NAMES.SET_NAMED_RANGE_ACTION, SetNamedRangeAction);
CommandManager.register(ACTION_NAMES.ADD_NAMED_RANGE_ACTION, AddNamedRangeAction);
CommandManager.register(ACTION_NAMES.SET_RANGE_FORMAT_ACTION, SetRangeFormatAction);
CommandManager.register(
    ACTION_NAMES.SET_RANGE_FORMULA_ACTION,
    SetRangeFormulaAction
);
CommandManager.register(ACTION_NAMES.SET_RANGE_NOTE_ACTION, SetRangeNoteAction);
CommandManager.register(ACTION_NAMES.INSERT_SHEET_ACTION, InsertSheetAction);
CommandManager.register(ACTION_NAMES.REMOVE_SHEET_ACTION, RemoveSheetAction);
CommandManager.register(ACTION_NAMES.SET_SHEET_ORDER_ACTION, SetSheetOrderAction);
CommandManager.register(ACTION_NAMES.SET_SHEET_ORDER_ACTION, SetSheetOrderAction);
CommandManager.register(ACTION_NAMES.SET_ZOOM_RATIO_ACTION, SetZoomRatioAction);

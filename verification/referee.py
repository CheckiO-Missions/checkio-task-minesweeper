from checkio.signals import ON_CONNECT
from checkio import api
from checkio.referees.multicall import CheckiORefereeMulti

from tests import TESTS


def initial_referee(mine_map):
    return {
        "input": [
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
            [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        ],
        "mine_map": mine_map

    }


def process_referee(referee_data, user_result):
    mine_map = referee_data['mine_map']
    input_map = referee_data['input']
    if not isinstance(user_result, (list, tuple)) or len(user_result) != 3:
        referee_data.update({"result": False, "result_addon": "The function should return a list with three values."})
        return referee_data
    is_mine, row, col = user_result
    if not isinstance(is_mine, bool) or not isinstance(row, int) or not isinstance(col, int):
        referee_data.update({"result": False, "result_addon": "Result list format is [bool, int, int]"})
        return referee_data
    if 10 <= row or 0 > row or 10 <= col or 0 > col:
        referee_data.update({"result": False, "result_addon": "You gave the wrong coordinates."})
        return referee_data
    if input_map[row][col] != -1:
        referee_data.update({"result": False, "result_addon": "You tried to uncover or mark already opened cell."})
        return referee_data
    if is_mine and not mine_map[row][col]:
        referee_data.update({"result": False, "result_addon": "You marked the wrong cell."})
        return referee_data
    if not is_mine and mine_map[row][col]:
        referee_data.update({"result": False, "result_addon": "You uncovered a mine. BANG!"})
        return referee_data
    if is_mine:
        input_map[row][col] = 9
        referee_data.update({"result": True, "result_addon": "Next move", "input": input_map})
        return referee_data
    else:
        input_map = build_map(input_map, mine_map, row, col)
        referee_data.update({"result": True, "result_addon": "Next move", "input": input_map})
        return referee_data


def build_map(input_map, mine_map, row, col):
    opened = [(row, col)]
    while opened:
        i, j = opened.pop(0)
        neighs = [(i + x, j + y) for x, y in [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
                  if 0 <= i + x < 10 and 0 <= j + y < 10]
        value = sum([mine_map[k][l] for k, l in neighs])
        input_map[i][j] = value
        if not value:
            for k, l in neighs:
                if input_map[k][l] == -1 and (k, l) not in opened:
                    opened.append((k, l))
    return input_map


def is_win_referee(referee_data):
    mine_map = referee_data['mine_map']
    input_map = referee_data['input']
    mines = sorted([(x, y) for x in range(10) for y in range(10) if mine_map[x][y]])
    empties = sorted([(x, y) for x in range(10) for y in range(10) if not mine_map[x][y]])
    marked_mines = sorted([(x, y) for x in range(10) for y in range(10) if input_map[x][y] == 9])
    uncovered = sorted([(x, y) for x in range(10) for y in range(10) if 0 <= input_map[x][y] < 9])
    if mines == marked_mines or uncovered == empties:
        return True
    return False



api.add_listener(
    ON_CONNECT,
    CheckiORefereeMulti(
        tests=TESTS,
        initial_referee=initial_referee,
        process_referee=process_referee,
        is_win_referee=is_win_referee,
    ).on_ready)
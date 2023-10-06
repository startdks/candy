import random
import collections

suits = {1: "\u2663", 2: "\u2665",
         3: "\u2666", 4: "\u2660", 5: "\u25CF", 6: "\u25A0", 7: "\u25B2", 8: "\u2605"}
board = [[suits[random.randint(1, 8)] for _ in range(4)] for _ in range(5)]


def find():
    crush_set = set()
    for r in range(len(board)):
        for c in range(len(board[0])):
            if r >= 1 and r < len(board) - 1 and board[r-1][c] == board[r][c] == board[r+1][c]:
                crush_set.add((r - 1, c))
                crush_set.add((r, c))
                crush_set.add((r + 1, c))
            if c >= 1 and c < len(board[0]) - 1 and board[r][c-1] == board[r][c] == board[r][c+1]:
                crush_set.add((r, c - 1))
                crush_set.add((r, c))
                crush_set.add((r, c + 1))
    return crush_set


def crush(crush_set):
    for r, c in crush_set:
        board[r][c] = 0


def replace():
    suits = {1: "\u2663", 2: "\u2665",
             3: "\u2666", 4: "\u2660", 5: "\u25CF", 6: "\u25A0", 7: "\u25B2", 8: "\u2605"}
    for r in range(len(board)):
        for c in range(len(board[0])):
            if board[r][c] == 0:
                board[r][c] = suits[random.randint(1, 8)]


def drop():
    for c in range(len(board[0])):
        r_level = -1
        for r in range(len(board)-1, -1, -1):
            if board[r][c] == 0:
                r_level = max(r_level, r)
            elif board[r][c] != 0:
                board[r][c], board[r_level][c] = board[r_level][c], board[r][c]
                r_level -= 1


def swap():
    first = [0, 0]
    second = [0, 0]
    first[0] = int(input())
    first[1] = int(input())
    second[0] = int(input())
    second[1] = int(input())
    board[first[0]][first[1]], board[second[0]][second[1]
                                                ] = board[second[0]][second[1]], board[first[0]][first[1]]

    crush_set = find()
    while crush_set:
        crush(crush_set)
        drop()
        replace()
        crush_set = find()
        for row in board:
            print(" ".join(row))
        print("\n")


def remove():
    crush_set = find()
    while crush_set:
        crush(crush_set)
        drop()
        replace()
        crush_set = find()


remove()
for row in board:
    print(" ".join(row))
while True:
    swap()


# crush_set = find()
# while crush_set:
#     crush(crush_set)
#     drop()
#     crush_set = find()
# print(isValid())
# print(board)

# Python Exceptions Cheat Sheet

A comprehensive list of Python's built-in exceptions, with explanations and examples. Use this cheat sheet as a quick reference for error handling and debugging in your Python projects.

---

## Table of Contents

1. [Syntax Errors](#syntax-errors)
2. [Name & Type Errors](#name--type-errors)
3. [Value & Range Errors](#value--range-errors)
4. [Index & Key Errors](#index--key-errors)
5. [File & OS Errors](#file--os-errors)
6. [Import & Module Errors](#import--module-errors)
7. [Zero Division Errors](#zero-division-errors)
8. [Attribute & Runtime Errors](#attribute--runtime-errors)
9. [Assertion & Control Flow Exceptions](#assertion--control-flow-exceptions)
10. [Less Common Errors](#less-common-errors)

---

## Syntax Errors

- **SyntaxError**: Invalid Python syntax detected before execution.

  ```python
  # Missing colon after if
  if True print("Hello")
  ```

- **IndentationError**: Incorrect indentation.

  ```python
  def greet():
  print("Hi")  # Should be indented
  ```

---

## Name & Type Errors

- **NameError**: Variable or name not defined.

  ```python
  print(unknown_var)
  # NameError: name 'unknown_var' is not defined
  ```

- **TypeError**: Unsupported operation or mismatched types.

  ```python
  result = 5 + "5"  # Cannot add int and str
  ```

---

## Value & Range Errors

- **ValueError**: Correct type but invalid value.

  ```python
  int("abc")  # ValueError: invalid literal for int()
  ```

- **OverflowError**: Numeric operation exceeds limits.

  ```python
  import math
  math.exp(1000)  # OverflowError
  ```

---

## Index & Key Errors

- **IndexError**: Sequence index out of range.

  ```python
  my_list = [1, 2, 3]
  my_list[5]  # IndexError
  ```

- **KeyError**: Dictionary key not found.

  ```python
  my_dict = {"a": 1}
  my_dict["b"]  # KeyError
  ```

---

## File & OS Errors

- **FileNotFoundError**: File or directory does not exist.

  ```python
  open("nonexistent.txt")
  ```

- **PermissionError**: Insufficient permissions.

  ```python
  open("/root/secret.txt", "r")
  ```

- **IsADirectoryError / NotADirectoryError**: Wrong path type.

- **OSError**: General OS-related error.

---

## Import & Module Errors

- **ImportError**: Failed to import name from module.

  ```python
  from math import cube  # No such function
  ```

- **ModuleNotFoundError**: Module does not exist.

  ```python
  import nonexistent_module
  ```

---

## Zero Division Errors

- **ZeroDivisionError**: Division or modulo by zero.
  ```python
  5 / 0  # ZeroDivisionError
  ```

---

## Attribute & Runtime Errors

- **AttributeError**: Object has no such attribute.

  ```python
  "hello".push()  # AttributeError
  ```

- **RuntimeError**: Generic runtime exception.

  ```python
  raise RuntimeError("Something went wrong")
  ```

---

## Assertion & Control Flow Exceptions

- **AssertionError**: Failed `assert` statement.

  ```python
  assert 2 + 2 == 5  # AssertionError
  ```

- **StopIteration / StopAsyncIteration**: Iterator exhaustion.

- **EOFError**: `input()` hits end-of-file.

- **KeyboardInterrupt**: User interruption (Ctrl+C).

- **SystemExit**: Raised by `sys.exit()`.

---

## Less Common Errors

- **MemoryError**: Not enough memory.

- **FloatingPointError**: Floating point operation error.

- **NotImplementedError**: Abstract method not implemented.

---

*Happy coding and robust error handling!*

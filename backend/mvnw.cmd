@echo off
setlocal enabledelayedexpansion
if "%JAVA_HOME%"=="" set "JAVA_HOME=C:\Program Files\Java\jdk-23"
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo JAVA_HOME not found. Please set JAVA_HOME to your JDK directory.
  exit /b 1
)

set "MAVEN_PROJECTBASEDIR=%~dp0"
set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
rem Strip the trailing backslash so a quoted -D...=%MAVEN_PROJECTBASEDIR% doesn't
rem escape the closing quote and corrupt the java argument list.
if "%MAVEN_PROJECTBASEDIR:~-1%"=="\" set "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

"%JAVA_HOME%\bin\java.exe" -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
exit /b %ERRORLEVEL%
